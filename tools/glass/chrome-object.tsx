/**
 * Objeto 3D de cada Space, solo en cromo (decisión del dueño: nada de vidrio).
 * Basado en glass-object.tsx del sitio oscuro (pixy-web): mismas poses, mismo cambio de modelo
 * (se encoge, cambia y vuelve) y el giro que se acelera con el warp del fondo. Sin halos de color.
 * El cromo refleja un estudio del color del tema (claro u oscuro): sin él se veía casi negro.
 * Los GLB salen de pixy-web (scripts/models) y viven en assets/models/ (incluidos en el repositorio por decisión del dueño, que asume la licencia de Envato).
 */
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, useGLTF } from "@react-three/drei";

export type ModelSlug = "pixy" | "resto" | "tiendas" | "inmobiliaria" | "edu" | "agencias" | "saas";

const SLUGS: ModelSlug[] = ["resto", "agencias", "tiendas", "inmobiliaria", "edu", "saas"];
const modelUrl = (base: string, slug: ModelSlug) => `${base}/${slug}.glb`;

/** Pose de reposo de cada modelo (radianes) y ajuste de tamaño; igual que en el sitio oscuro. */
const POSE: Record<ModelSlug, { rotation: [number, number, number]; scale?: number }> = {
  pixy: { rotation: [0.28, -0.55, 0] },
  saas: { rotation: [0.32, -0.5, 0] },
  resto: { rotation: [0.3, 0, 0] },
  tiendas: { rotation: [0.1, 0.5, 0] },
  inmobiliaria: { rotation: [0.2, 0.3, -0.3] },
  edu: { rotation: [0.12, -0.25, 0], scale: 1.6 },
  agencias: { rotation: [0.1, -0.7, 0.1] },
};

/** Tema del sitio (atributo data-theme de <html>); cambia en vivo con el botón de tema. */
function useLightTheme() {
  const read = () => document.documentElement.getAttribute("data-theme") === "light";
  const [light, setLight] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setLight(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return light;
}

// Estudio que refleja el cromo en cada tema y acabado del metal
const STUDIO = {
  light: { backdrop: "#f3f5f9", color: "#f6f7fa", roughness: 0.18 },
  dark: { backdrop: "#2a2e37", color: "#e8e8ee", roughness: 0.12 },
};

// Puntero global normalizado (-1..1): el objeto mira hacia el cursor.
const pointer = { x: 0, y: 0 };

type Props = { base: string; slug: ModelSlug; accent: string; drift: () => number; /** Se llama una vez, cuando el primer modelo ya está en escena. */ onReady?: () => void };

export function ChromeObject({ base, slug, accent, drift, onReady, distance = 6.5 }: Props & { distance?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} style={{ width: "100%", height: "100%" }}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, distance], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene base={base} slug={slug} accent={accent} drift={drift} onReady={onReady} />
      </Canvas>
    </div>
  );
}

function Scene({ base, slug, accent, drift, onReady }: Props) {
  const group = useRef<THREE.Group>(null);
  const [shown, setShown] = useState(slug);
  const spin = useRef(0);
  const scale = useRef(0);
  // La primera aparición crece despacio; los cambios de destino son rápidos
  const appeared = useRef(false);
  const studio = STUDIO[useLightTheme() ? "light" : "dark"];
  useEffect(() => {
    CHROME.color.set(studio.color);
    CHROME.roughness = studio.roughness;
  }, [studio]);

  // Todos los modelos se descargan al montar: los cambios de destino son instantáneos.
  useEffect(() => SLUGS.forEach((s) => useGLTF.preload(modelUrl(base, s))), [base]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const swapping = shown !== slug;
    scale.current = THREE.MathUtils.damp(scale.current, swapping ? 0 : 1, swapping ? 14 : appeared.current ? 6 : 1.8, delta);
    if (scale.current > 0.98) appeared.current = true;
    if (swapping && scale.current < 0.04) setShown(slug);
    g.scale.setScalar(Math.max(0.001, scale.current));

    const warp = Math.abs(drift() - 1);
    spin.current += delta * (0.35 + warp * 0.35 + (swapping ? 4 : 0));
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, spin.current * 0.25 + pointer.x * 0.7, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.y * 0.35, 4, delta);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <group ref={group}>
          <Suspense fallback={null}>
            <Model base={base} slug={shown} onReady={onReady} />
          </Suspense>
        </group>
      </Float>
      {/* El cromo refleja el estudio: fondo del color del tema, luz blanca y dos paneles con el color del Space */}
      <Environment resolution={256}>
        <mesh scale={40}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color={studio.backdrop} side={THREE.BackSide} toneMapped={false} />
        </mesh>
        <Lightformer form="ring" intensity={3} position={[0, 4, 3]} scale={3} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[-5, 1, 1]} scale={[3, 6, 1]} color={accent} />
        <Lightformer form="rect" intensity={2.5} position={[5, -1, 1]} scale={[3, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} position={[0, -4, -2]} scale={[8, 1, 1]} color="#ffffff" />
      </Environment>
    </>
  );
}

const CHROME = new THREE.MeshStandardMaterial({ color: "#e8e8ee", metalness: 1, roughness: 0.12 });

/** Cada GLB trae hasta cuatro mallas (glass, chrome, accent, pearl): aquí todas van en cromo. */
function Model({ base, slug, onReady }: { base: string; slug: ModelSlug; onReady?: () => void }) {
  const { nodes } = useGLTF(modelUrl(base, slug));
  // Al montar, el GLB ya cargó (Suspense): avisa para que el lienzo aparezca con un fundido
  useEffect(() => onReady?.(), [onReady]);
  const pose = POSE[slug];
  return (
    <group rotation={pose.rotation} scale={pose.scale ?? 1}>
      {(["glass", "chrome", "accent", "pearl"] as const).map((role) => {
        const node = nodes[role] as THREE.Mesh | undefined;
        if (!node?.geometry) return null;
        return <mesh key={role} geometry={node.geometry} position={node.position} quaternion={node.quaternion} scale={node.scale} material={CHROME} />;
      })}
    </group>
  );
}
