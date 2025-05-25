import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

// Thông số quỹ đạo cách đều quanh tâm
const NUM_ORBITS = 4
const RADIUS = 15
const electronLabels = ['mây', 'mưa', 'gió', 'nắng']
const orbits = Array.from({ length: NUM_ORBITS }).map((_, i) => {
  const tilt = (Math.PI / NUM_ORBITS) * i
  return {
    radius: RADIUS,
    tilt,
    speed: 1 + 0.3 * i,
    color: '#00eaff',
    label: electronLabels[i]
  }
})

// Hạt nhân wireframe
function Nucleus({ centerText }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.3
    }
  })
  return (
    <group>
      {/* Wireframe sphere */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[9, 64, 64]} />
        <meshPhysicalMaterial
          color="#00eaff"
          metalness={0.7}
          roughness={0.15}
          clearcoat={0.7}
          clearcoatRoughness={0.1}
          transmission={0.5}
          thickness={1.5}
          ior={1.3}
          reflectivity={0.8}
          opacity={0.85}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
      {/* Fresnel-like glow effect */}
      <mesh>
        <sphereGeometry args={[9.25, 64, 64]} />
        <meshBasicMaterial color="#fff" transparent={true} opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Glow sphere nhỏ hơn */}
      <mesh>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial color="#00eaff" transparent={true} opacity={0.12} depthWrite={false} />
      </mesh>
      {/* Center text inside nucleus */}
      <Text
        position={[0, 0, 0]}
        fontSize={3.2}
        color="#FFD700"
        outlineColor="#fff"
        outlineWidth={0.12}
        depthTest={false}
        anchorX="center"
        anchorY="middle"
        renderOrder={10}
      >
        {centerText}
      </Text>
    </group>
  )
}

// Quỹ đạo glowing
function OrbitPath({ radius, tilt, color }) {
  // Tạo đường ellipse 3D
  const curve = new THREE.EllipseCurve(
    0, 0, radius, radius, 0, 2 * Math.PI, false, 0
  )
  const points = curve.getPoints(200).map(
    p => new THREE.Vector3(p.x, 0, p.y)
  )
  const path = new THREE.CatmullRomCurve3(points, true)
  const geometry = new THREE.TubeGeometry(path, 200, 0.18, 16, true)
  const glowGeometry = new THREE.TubeGeometry(path, 200, 0.38, 16, true)
  return (
    <group rotation={[tilt, 0, 0]}>
      {/* Lớp phát sáng chính - luôn rõ nét */}
      <mesh renderOrder={1}>
        <primitive object={geometry} attach="geometry" />
        <meshBasicMaterial color={color} transparent={false} opacity={1} />
      </mesh>
      {/* Lớp glow ngoài - mờ, không ảnh hưởng depth */}
      <mesh renderOrder={2}>
        <primitive object={glowGeometry} attach="geometry" />
        <meshBasicMaterial color="#fff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

// Electron glowing di chuyển trên quỹ đạo
function Electron({ radius, tilt, speed, color, offset = 0, label }) {
  const ref = useRef()
  const labelRef = useRef()
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime() * speed + offset
    const x = Math.cos(t) * radius
    const y = Math.sin(t) * radius * Math.sin(tilt)
    const z = Math.sin(t) * radius * Math.cos(tilt)
    if (ref.current) {
      ref.current.position.set(x, y, z)
    }
    // Billboard effect cho label
    if (labelRef.current) {
      labelRef.current.quaternion.copy(camera.quaternion)
    }
  })
  return (
    <group ref={ref}>
      {/* Glow ngoài electron */}
      <mesh>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
      {/* Electron chính */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={2.5} />
      </mesh>
      {/* Label từ ví dụ */}
      <group ref={labelRef} position={[0, 1.8, 0]}>
        <Text fontSize={1.5} color="#FFD700" outlineColor="#fff" outlineWidth={0.08}>
          {label}
        </Text>
      </group>
    </group>
  )
}

export default function WordSphere() {
  // State cho text trung tâm
  const [centerTextIdx, setCenterTextIdx] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCenterTextIdx(idx => (idx + 1) % electronLabels.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="word-sphere-container" style={{ 
      width: '100vw', height: '100vh', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent',
      position: 'relative',
      zIndex: 2
    }}>
      <Canvas camera={{ position: [0, 0, 38], fov: 60 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="#00eaff" />
        <Nucleus centerText={null} />
        {/* Center text always on top */}
        <Text
          position={[0, 0, 0]}
          fontSize={3.2}
          color="#FFD700"
          outlineColor="#fff"
          outlineWidth={0.12}
          depthTest={false}
          depthWrite={false}
          renderOrder={999}
          anchorX="center"
          anchorY="middle"
        >
          {electronLabels[centerTextIdx]}
        </Text>
        {orbits.map((orbit, idx) => (
          <group key={idx}>
            <OrbitPath {...orbit} />
            {/* Mỗi quỹ đạo chỉ có 1 electron và 1 label */}
            <Electron {...orbit} offset={0} />
          </group>
        ))}
        <OrbitControls enablePan={false} minDistance={20} maxDistance={80} />
      </Canvas>
    </div>
  )
}