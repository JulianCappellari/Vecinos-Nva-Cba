"use client";
export default function CommunityErrorPage({ reset }: { reset: () => void }) {
  return <div className="community-container community-empty"><h1>Este rincón necesita un momento.</h1><p>No pudimos cargar la página. Podés volver a intentar sin perder tus publicaciones guardadas.</p><button className="c-button" onClick={reset}>Volver a intentar</button></div>;
}
