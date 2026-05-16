import { Link } from "react-router-dom";

type LogoProps = {
  inverted?: boolean;
};

export default function Logo({ inverted = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${inverted ? "rounded bg-white px-4 py-3" : ""}`}
      aria-label="Oxymed Medikal Anasayfa"
    >
      <img
        src="/assets/brand/oxymed-logo.webp"
        alt="Oxymed Medikal"
        className="h-auto w-[190px] sm:w-[220px]"
      />
    </Link>
  );
}
