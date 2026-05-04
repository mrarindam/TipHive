export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-transparent">
      {children}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, #root-container, main { 
          background: transparent !important; 
          background-color: transparent !important; 
          border: none !important;
        }
        nav, footer { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
      ` }} />
    </div>
  );
}
