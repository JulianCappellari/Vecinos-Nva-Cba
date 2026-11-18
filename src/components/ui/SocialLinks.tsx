import Link from "next/link";
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoGlobeOutline,
} from "react-icons/io5";

interface Red {
  url: string;
  tipo: string;
}

const ICONOS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  Instagram: { icon: <IoLogoInstagram />, color: "bg-pink-500 hover:bg-pink-600", label: "Instagram" },
  Twitter: { icon: <IoLogoTwitter />, color: "bg-sky-500 hover:bg-sky-600", label: "X / Twitter" },
  Linkedin: { icon: <IoLogoLinkedin />, color: "bg-blue-700 hover:bg-blue-800", label: "LinkedIn" },
  Facebook: { icon: <IoLogoFacebook />, color: "bg-blue-600 hover:bg-blue-700", label: "Facebook" },
  Web: { icon: <IoGlobeOutline />, color: "bg-celeste-950 hover:bg-celeste-800", label: "Sitio web" },
};

export const SocialLinks = ({ redes }: { redes: Red[] }) => {
  if (!redes?.length) return null;
  return (
    <ul className="flex flex-wrap gap-3">
      {redes.map((r) => {
        const d = ICONOS[r.tipo];
        if (!d) return null;
        return (
          <li key={r.url}>
            <Link
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={d.label}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white transition hover:-translate-y-1 ${d.color}`}
            >
              {d.icon}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
