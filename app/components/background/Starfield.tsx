// app/components/background/Starfield.tsx
// Calm, dreamy, CSP-safe starfield (very light CPU/GPU use)

export default function Starfield() {
  return (
    <>
      <div className="om-star om-star--1" />
      <div className="om-star om-star--2" />
      <div className="om-star om-star--3" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .om-star,
          .om-star::before,
          .om-star::after {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            background-color: #0a0713;
            background-image:
              radial-gradient(1.5px 1.5px at 12% 32%, rgba(255,255,255,.85) 45%, transparent 46%),
              radial-gradient(1.2px 1.2px at 72% 12%, rgba(255,255,255,.7) 45%, transparent 46%),
              radial-gradient(1px 1px at 44% 68%, rgba(255,255,255,.6) 45%, transparent 46%),
              radial-gradient(1.4px 1.4px at 18% 78%, rgba(255,200,255,.5) 45%, transparent 46%),
              radial-gradient(1px 1px at 88% 50%, rgba(200,220,255,.55) 45%, transparent 46%);
            background-repeat: repeat;
            background-size: 600px 600px, 700px 700px, 800px 800px, 900px 900px, 1000px 1000px;
            animation: om-drift 160s linear infinite;
          }
          .om-star--2 {
            opacity: .55;
            animation-duration: 220s;
            background-size: 700px 700px, 800px 800px, 900px 900px, 1000px 1000px, 1100px 1100px;
          }
          .om-star--3 {
            opacity: .35;
            animation-duration: 280s;
            background-size: 800px 800px, 900px 900px, 1000px 1000px, 1100px 1100px, 1200px 1200px;
          }
          @keyframes om-drift {
            from { transform: translateY(0); }
            to   { transform: translateY(-420px); }
          }
        `,
        }}
      />
    </>
  );
}
