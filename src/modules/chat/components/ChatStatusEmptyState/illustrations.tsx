import { palette } from "@fundacja-peryskop/ui";
import type { ReactNode } from "react";
import type { IllustrationKind } from "./content";

/*
 * Decorative, animated scenes for the chat empty states. Shapes and motion
 * follow the approved prototype; colours come from the Peryskop palette (raw
 * palette tokens are reserved for decorative art like this). Animations are
 * plain CSS keyframes so they stay cheap, and they all stop when the visitor
 * prefers reduced motion.
 */

const P = palette.primary;
const S = palette.secondary;
const SKY = palette.sky;
const WHITE = palette.common.white;

/** Prefixed (`cse-` = chat status empty) so nothing leaks into other screens. */
export const ILLUSTRATION_STYLE = `
@keyframes cse-ripple{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.45);opacity:0}}
@keyframes cse-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cse-look{0%,38%{transform:scaleX(1)}46%,88%{transform:scaleX(-1)}96%,100%{transform:scaleX(1)}}
@keyframes cse-wave-left{from{transform:translateX(0)}to{transform:translateX(-50px)}}
@keyframes cse-wave-right{from{transform:translateX(-50px)}to{transform:translateX(0)}}
@keyframes cse-twinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
@keyframes cse-glint{0%,70%,100%{opacity:.9}80%{opacity:.2}}
@keyframes cse-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cse-float-down{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
@keyframes cse-beat{0%,60%,100%{transform:scale(1)}12%{transform:scale(1.16)}24%{transform:scale(1)}36%{transform:scale(1.1)}}
@keyframes cse-bubble{0%{opacity:0;transform:translateY(0)}20%{opacity:.9}100%{opacity:0;transform:translateY(-110px)}}
@keyframes cse-typing{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-6px);opacity:1}}
@keyframes cse-breathe{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes cse-pulse{0%,100%{box-shadow:0 0 0 0 ${P.base}80}50%{box-shadow:0 0 0 6px ${P.base}00}}
@keyframes cse-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.cse-ring{animation:cse-ripple 3.2s ease-out infinite}
.cse-ring.cse-d2{animation-delay:1.6s}
.cse-bob{animation:cse-bob 3.5s ease-in-out infinite}
.cse-head{transform-box:view-box;transform-origin:110px 80px;animation:cse-look 7s ease-in-out infinite}
.cse-wave-left{animation:cse-wave-left 3s linear infinite}
.cse-wave-right{animation:cse-wave-right 4s linear infinite}
.cse-star{transform-box:fill-box;transform-origin:center;animation:cse-twinkle 2.6s ease-in-out infinite}
.cse-star.cse-d1{animation-delay:.9s}.cse-star.cse-d2{animation-delay:1.7s}.cse-star.cse-d3{animation-delay:.4s}
.cse-glint{animation:cse-glint 3.5s ease-in-out infinite}
.cse-float{animation:cse-float 4s ease-in-out infinite}
.cse-float-down{animation:cse-float-down 5s ease-in-out infinite}
.cse-heart{transform-box:fill-box;transform-origin:center;animation:cse-beat 1.8s ease-in-out infinite}
.cse-bubble{animation:cse-bubble 4.5s ease-in infinite}
.cse-bubble.cse-d1{animation-delay:1.1s}.cse-bubble.cse-d2{animation-delay:2.3s}.cse-bubble.cse-d3{animation-delay:3.4s}
.cse-typing{transform-box:fill-box;transform-origin:center;animation:cse-typing 1.4s ease-in-out infinite}
.cse-typing.cse-d1{animation-delay:.18s}.cse-typing.cse-d2{animation-delay:.36s}
.cse-breathe{animation:cse-breathe 3.2s ease-in-out infinite}
.cse-breathe.cse-d1{animation-delay:.4s}
.cse-pulse{animation:cse-pulse 1.8s ease-in-out infinite}
.cse-in{animation:cse-rise .6s ease-out both}
.cse-in.cse-d1{animation-delay:.08s}.cse-in.cse-d2{animation-delay:.16s}.cse-in.cse-d3{animation-delay:.24s}.cse-in.cse-d4{animation-delay:.32s}
@media (prefers-reduced-motion: reduce){.cse-root *,.cse-root{animation:none !important}}
`;

interface FrameProps {
    size: number;
    /** Expanding "sonar" rings - used while something is being searched for. */
    rings?: boolean;
    children: ReactNode;
}

/** A soft tinted disc that clips the scene, optionally with sonar rings. */
function Frame({ size, rings = false, children }: FrameProps) {
    const ringStyle = {
        position: "absolute" as const,
        inset: 0,
        borderRadius: "50%",
        border: `2px solid ${P.lightest}`,
    };
    return (
        <div aria-hidden style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            {rings ? (
                <>
                    <div className="cse-ring" style={ringStyle} />
                    <div className="cse-ring cse-d2" style={ringStyle} />
                </>
            ) : null}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    overflow: "hidden",
                    // A lighter wash of the lightest brand tint, as in the prototype.
                    background: `${P.lightest}66`,
                }}
            >
                {children}
            </div>
        </div>
    );
}

const sparkle = (x: number, y: number, r: number) =>
    `M${x} ${y} l${r * 0.43} ${r} ${r} ${r * 0.43} -${r} ${r * 0.43} -${r * 0.43} ${r} -${r * 0.43} -${r} -${r} -${r * 0.43} ${r} -${r * 0.43}z`;

const WAVE = "q12.5 -7 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V220 H0 Z";

/** A periscope rising from the sea, slowly looking around - "we are searching". */
function Periscope({ size }: { size: number }) {
    return (
        <Frame size={size} rings>
            <svg width={size} height={size} viewBox="0 0 220 220" style={{ display: "block" }}>
                <g className="cse-star">
                    <path d={sparkle(58, 52, 7)} fill={S.light} />
                </g>
                <g className="cse-star cse-d1">
                    <path d={sparkle(172, 46, 5.5)} fill={P.light} />
                </g>
                <g className="cse-star cse-d2">
                    <path d={sparkle(40, 98, 4.5)} fill={P.light} />
                </g>
                <g className="cse-star cse-d3">
                    <path d={sparkle(186, 96, 4.5)} fill={S.light} />
                </g>
                <g className="cse-bob">
                    <rect x="100" y="78" width="20" height="130" rx="6" fill={P.dark} />
                    <rect x="103" y="84" width="5" height="120" rx="2.5" fill={P.lighter} opacity=".55" />
                    <g className="cse-head">
                        <rect x="98" y="64" width="52" height="30" rx="11" fill={P.base} />
                        <rect x="138" y="68" width="18" height="22" rx="6" fill={P.darker} />
                        <rect x="146" y="71" width="8" height="16" rx="4" fill={P.darkest} />
                        <rect className="cse-glint" x="148" y="73" width="2.5" height="6" rx="1.25" fill={WHITE} />
                        <rect x="104" y="69" width="26" height="4" rx="2" fill={P.lighter} opacity=".6" />
                    </g>
                </g>
                <g className="cse-wave-right">
                    <path d={`M0 152 ${WAVE}`} fill={P.lightest} opacity=".9" />
                </g>
                <g className="cse-wave-left">
                    <path d={`M0 166 ${WAVE.replace("q12.5 -7", "q12.5 -8")}`} fill={P.lighter} opacity=".65" />
                </g>
            </svg>
        </Frame>
    );
}

/** A speech bubble with a beating heart and rising bubbles - "someone will talk to you". */
function HeartBubble({ size, rings }: { size: number; rings: boolean }) {
    return (
        <Frame size={size} rings={rings}>
            <svg width={size} height={size} viewBox="0 0 220 220" style={{ display: "block" }}>
                <circle className="cse-bubble" cx="48" cy="190" r="6" fill={P.lighter} />
                <circle className="cse-bubble cse-d1" cx="176" cy="196" r="5" fill={P.lightest} />
                <circle className="cse-bubble cse-d2" cx="70" cy="200" r="4" fill={P.light} />
                <circle className="cse-bubble cse-d3" cx="158" cy="192" r="7" fill={P.lighter} />
                <g className="cse-float">
                    <path
                        d="M76 60 H144 A20 20 0 0 1 164 80 V122 A20 20 0 0 1 144 142 H98 L76 160 L80 142 H76 A20 20 0 0 1 56 122 V80 A20 20 0 0 1 76 60 Z"
                        fill={WHITE}
                        stroke={P.lightest}
                        strokeWidth="2"
                    />
                    <path
                        className="cse-heart"
                        d="M110 122 C92 110 84 101 84 91 C84 83 90 77 97.5 77 C103 77 107.5 80 110 85 C112.5 80 117 77 122.5 77 C130 77 136 83 136 91 C136 101 128 110 110 122 Z"
                        fill={P.base}
                    />
                    <path
                        d="M95 86 C96 83 98.5 81.5 101 81.5"
                        stroke={WHITE}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        opacity=".7"
                    />
                </g>
            </svg>
        </Frame>
    );
}

/**
 * Two chat bubbles. `typing` - three bouncing dots ("it's quiet here, for
 * now"); `resting` - softly breathing pause bars ("nothing is being assigned").
 */
function ChatBubbles({ size, resting }: { size: number; resting: boolean }) {
    return (
        <Frame size={size}>
            <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block" }}>
                <g className="cse-float-down">
                    <path
                        d="M104 46 H160 A18 18 0 0 1 178 64 V90 A18 18 0 0 1 160 108 H158 L160 122 L144 108 H104 A18 18 0 0 1 86 90 V64 A18 18 0 0 1 104 46 Z"
                        fill={P.lightest}
                    />
                    <rect x="102" y="64" width="56" height="7" rx="3.5" fill={P.lighter} />
                    <rect x="102" y="80" width="38" height="7" rx="3.5" fill={P.lighter} />
                </g>
                <g className="cse-float">
                    <path
                        d="M42 92 H116 A20 20 0 0 1 136 112 V132 A20 20 0 0 1 116 152 H62 L44 166 L46 151 A20 20 0 0 1 22 132 V112 A20 20 0 0 1 42 92 Z"
                        fill={WHITE}
                        stroke={SKY.light}
                        strokeWidth="2"
                    />
                    {resting ? (
                        <>
                            <rect
                                className="cse-breathe"
                                x="66"
                                y="108"
                                width="9"
                                height="28"
                                rx="4.5"
                                fill={P.light}
                            />
                            <rect
                                className="cse-breathe cse-d1"
                                x="84"
                                y="108"
                                width="9"
                                height="28"
                                rx="4.5"
                                fill={P.light}
                            />
                        </>
                    ) : (
                        <>
                            <circle className="cse-typing" cx="58" cy="122" r="6" fill={P.base} />
                            <circle className="cse-typing cse-d1" cx="79" cy="122" r="6" fill={P.base} />
                            <circle className="cse-typing cse-d2" cx="100" cy="122" r="6" fill={P.base} />
                        </>
                    )}
                </g>
            </svg>
        </Frame>
    );
}

export function EmptyStateIllustration({ kind, size }: { kind: IllustrationKind; size: number }) {
    switch (kind) {
        case "periscope":
            return <Periscope size={size} />;
        case "heart-searching":
            return <HeartBubble size={size} rings />;
        case "heart":
            return <HeartBubble size={size} rings={false} />;
        case "resting":
            return <ChatBubbles size={size} resting />;
        case "typing":
            return <ChatBubbles size={size} resting={false} />;
    }
}
