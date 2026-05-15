import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/brevo';
import { welcomeTemplate } from '@/lib/email-templates';
import { privy } from '@/lib/privy';
import type { LinkedAccount } from '@privy-io/node';



function generateReferralCode(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function avatarFor(wallet: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${wallet}`;
}

function isWalletAccount(account: LinkedAccount): account is LinkedAccount & { address: string } {
  return account.type === 'wallet' && 'address' in account;
}

function isEmailAccount(account: LinkedAccount): account is LinkedAccount & { address: string } {
  return account.type === 'email' && 'address' in account;
}

export async function GET(request: NextRequest) {
  console.log('API: GET /api/auth');
  try {
    const header = request.headers.get('authorization');
    const token = header?.replace('Bearer ', '');
    const wallet = request.nextUrl.searchParams.get('wallet');
    const requestedEmail = request.nextUrl.searchParams.get('email');

    if (!token) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    let verifiedDid: string;
    let linkedWallets: string[] = [];
    let verifiedEmail: string | null = null;

    try {
      const verified = await privy.utils().auth().verifyAccessToken(token);
      verifiedDid = verified.user_id;
    } catch (e) {
      console.error('AUTH_API: Token verification failed', e);
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (wallet || requestedEmail) {
      try {
        // To prevent wallet hijacking, we MUST fetch the user from Privy
        // to see which wallets and emails they actually own.
        const privyUser = await privy.users()._get(verifiedDid);
        linkedWallets = privyUser.linked_accounts
          .filter(isWalletAccount)
          .map((acc) => acc.address.toLowerCase());
        verifiedEmail = privyUser.linked_accounts
          .filter(isEmailAccount)
          .map((acc) => acc.address.toLowerCase().trim())
          .find((address) => address === requestedEmail?.toLowerCase().trim()) || null;
      } catch (e) {
        console.error('AUTH_API: Privy User Fetch failed', e);
        return NextResponse.json({ error: 'Unable to verify wallets' }, { status: 502 });
      }
    }

    const did = verifiedDid; // Use the verified DID instead of query param

    // Only process the wallet if it is actually linked to this Privy user
    const normalizedWallet = wallet && linkedWallets.includes(wallet.toLowerCase()) 
      ? wallet.toLowerCase() 
      : null;

    const supabase = createServerSupabase();
    
    const { data: dbUser, error: existingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('privy_did', did)
      .maybeSingle();

    let existingUser = dbUser;

    if (existingError) throw existingError;

    // Migrate old users who login with their wallet but don't have privy_did yet
    if (!existingUser && normalizedWallet) {
      const { data: legacyUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', normalizedWallet)
        .maybeSingle();

      if (legacyUser) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            privy_did: did,
            is_creator: true // Mark legacy users as creators so they skip onboarding
          })
          .eq('wallet_address', normalizedWallet)
          .select()
          .single();
        
        if (updateError) throw updateError;
        existingUser = updatedUser;
      }
    }

    if (existingUser) {
      // If user linked a wallet after signup, update their profile
      if (normalizedWallet && existingUser.wallet_address !== normalizedWallet) {
        // First check if this wallet is already claimed by another user (legacy account)
        const { data: conflictUser } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('wallet_address', normalizedWallet)
          .neq('privy_did', did) // not this user
          .maybeSingle();

        if (conflictUser) {
          // If a legacy account exists with this wallet, we merge: 
          // Move the privy_did to the legacy account and delete this "empty" Gmail account
          // ONLY if the current Gmail account is "empty" (has no username/display_name customizations)
          const isGmailEmpty = existingUser.username?.includes('did:privy') || existingUser.display_name?.includes('did:privy');
          
          if (isGmailEmpty) {
            const { data: mergedUser, error: mergeError } = await supabase
              .from('user_profiles')
              .update({ privy_did: did })
              .eq('wallet_address', normalizedWallet)
              .select()
              .single();
            
            if (!mergeError) {
              // Delete the now-redundant Gmail-only profile
              await supabase.from('user_profiles').delete().eq('privy_did', did);
              existingUser = mergedUser;
            }
          }
        } else {
          // No conflict, just update the current account
          const { data: updatedUser, error: updateError } = await supabase
            .from('user_profiles')
            .update({ wallet_address: normalizedWallet })
            .eq('privy_did', did)
            .select()
            .single();
          
          if (!updateError) {
            existingUser = updatedUser;
          }
        }
      }

      if (!existingUser.referral_code) {
        const { data: updatedWithRef } = await supabase
          .from('user_profiles')
          .update({ referral_code: generateReferralCode() })
          .eq('privy_did', did)
          .select()
          .single();
        if (updatedWithRef) existingUser = updatedWithRef;
      }

      // Automatically sync email from Privy if not already set
      if (verifiedEmail && !existingUser.notification_email) {
        const { data: updatedWithEmail } = await supabase
          .from('user_profiles')
          .update({ notification_email: verifiedEmail })
          .eq('privy_did', did)
          .select()
          .single();
        if (updatedWithEmail) existingUser = updatedWithEmail;
      }

      return NextResponse.json({ user: existingUser, isNewUser: false });
    }

    const seedInput = normalizedWallet || did.replace('did:privy:', '');
    const tempId = did.replace('did:privy:', '').slice(0, 12); // Shorten to pass DB constraints
    const { data: newUser, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        privy_did: did,
        wallet_address: normalizedWallet,
        username: tempId,
        display_name: tempId,
        bio: '',
        avatar_url: avatarFor(seedInput),
        notification_email: verifiedEmail, // Set email on signup only if it is linked in Privy
        is_creator: false,
        verified_on_chain: !!normalizedWallet,
        referral_code: generateReferralCode(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: retryUser } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('privy_did', did)
          .single();
        if (retryUser) {
          return NextResponse.json({ user: retryUser, isNewUser: false });
        }
      }
      throw insertError;
    }


    // Create welcome notification for ALL new users (wallet or email)
    const notificationAddress = normalizedWallet || did;
    await supabase.from('notifications').insert({
      user_address: notificationAddress,
      type: 'welcome',
      content: 'Welcome to TipHive! Your Web3 creator economy starts here. 🚀',
    });

    // --- BREVO INTEGRATION ---
    // If we have an email for the new user, send welcome email
    if (newUser.notification_email) {
      try {
        await sendEmail({
          to: newUser.notification_email,
          subject: 'Welcome to TipHive! 🚀',
          htmlContent: welcomeTemplate(newUser.username || 'Creator')
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }
    }
    // -------------------------

    return NextResponse.json({ user: newUser, isNewUser: true });
  } catch (error) {
    console.error('AUTH_API_ERROR:', error);
    const message = error instanceof Error ? error.message : 'Unable to load wallet profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
