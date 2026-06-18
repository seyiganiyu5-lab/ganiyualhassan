"use client";

interface AnimatedAvatarProps {
  imageUrl?: string | null;
  name?: string;
}

export function AnimatedAvatar({ imageUrl, name = "G" }: AnimatedAvatarProps) {
  if (imageUrl) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFC300] via-[#FFD60A] to-[#FFC300] blur-2xl opacity-50"
          style={{
            animation: "float-orb 8s ease-in-out infinite",
            transformOrigin: "center",
          }}
        />
        <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-[#FFC300]/30 glass-strong p-1">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
    );
  }

  // Animated silhouette/avatar placeholder
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      {/* Glow orbs */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFC300] via-[#FFD60A] to-[#FFC300] blur-3xl opacity-40"
        style={{
          animation: "float-orb 8s ease-in-out infinite",
          transformOrigin: "center",
        }}
      />

      {/* Rotating ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFC300]/40"
        style={{ animation: "spin-slow 30s linear infinite" }}
      />
      <div
        className="absolute inset-4 rounded-full border border-[#FFC300]/20"
        style={{ animation: "spin-reverse 40s linear infinite" }}
      />

      {/* Inner avatar */}
      <div className="absolute inset-8 overflow-hidden rounded-full glass-strong border border-[#FFC300]/30">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <svg
          viewBox="0 0 200 200"
          className="relative h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFC300" />
              <stop offset="100%" stopColor="#FFD60A" />
            </linearGradient>
            <linearGradient id="avatarGrad2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#000814" />
              <stop offset="100%" stopColor="#FFC300" />
            </linearGradient>
          </defs>
          {/* Silhouette */}
          <g>
            {/* Head */}
            <circle cx="100" cy="75" r="32" fill="url(#avatarGrad)" />
            {/* Shoulders/body */}
            <path
              d="M 40 180 Q 40 130 100 130 Q 160 130 160 180 Z"
              fill="url(#avatarGrad2)"
              style={{ transformOrigin: "100px 180px" }}
            />
            {/* Initial */}
            <text
              x="100"
              y="88"
              textAnchor="middle"
              className="font-black"
              fontSize="36"
              fill="#fff"
            >
              G
            </text>
          </g>
        </svg>
      </div>

      {/* Floating badges */}
      <div
        className="absolute -right-2 top-8 flex items-center gap-1.5 rounded-full glass-strong border border-border px-3 py-1.5 text-xs font-semibold shadow-lg"
        style={{ animation: "float-badge-up 3s ease-in-out infinite" }}
      >
        <span className="h-2 w-2 rounded-full bg-[#FFC300]" />
        Creative
      </div>
      <div
        className="absolute -left-2 bottom-16 flex items-center gap-1.5 rounded-full glass-strong border border-border px-3 py-1.5 text-xs font-semibold shadow-lg"
        style={{ animation: "float-badge-down 3.5s ease-in-out infinite" }}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Available
      </div>
    </div>
  );
}
