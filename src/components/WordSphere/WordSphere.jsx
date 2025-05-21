import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { LineMaterial, Wireframe, WireframeGeometry2 } from 'three-stdlib'

// Extend để sử dụng trong JSX
extend({ LineMaterial, Wireframe })

const WordSphere = ({ onWordSelect, word, selectedWord }) => {
  // Từ ở giữa quả cầu lấy từ props word
  // Các từ liên quan mock giữ nguyên (có thể lấy theo từ chính nếu muốn)
  const relatedWords = ['water', 'sun', 'earth', 'leaf', 'branch', 'root', 'forest', 'oxygen']
  console.log('selectedWord:', selectedWord)
  return (
    <div className="word-sphere-container">
      <div className={["canvas-container", selectedWord ? "move-to-corner" : ""].join(" ") }>
        <Canvas 
          style={{ width: '100vw', height: '100vh', display: 'block' }}
          camera={{ position: [-50, 0, 50], fov: 60 }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls minDistance={10} maxDistance={500} />
          <Sphere words={relatedWords} onWordSelect={onWordSelect} mainWord={word} />
        </Canvas>
      </div>
    </div>
  )
}

const Sphere = ({ words, onWordSelect, mainWord }) => {
  const meshRef = useRef()
  const wireframeRef = useRef()
  const wordObjects = useRef([])
  const { size, gl, camera } = useThree()
  const [centerWord, setCenterWord] = useState(mainWord)
  const lastAngleRef = useRef(0)
  // Tốc độ xoay ngẫu nhiên cho từng trục
  const rotationSpeed = useRef({
    x: 0.1 + Math.random() * 0.15, // 0.1 ~ 0.25
    y: 0.2 + Math.random() * 0.2,  // 0.2 ~ 0.4
    z: 0.05 + Math.random() * 0.1  // 0.05 ~ 0.15
  })

  // Khởi tạo wireframe geometry và lưu lại các đỉnh duy nhất
  const { wireframeGeometry, vertices } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(20, 0)
    const posAttr = geo.getAttribute('position')
    const verts = []
    const unique = new Set()
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i)
      const key = v.toArray().map(n => n.toFixed(4)).join(',')
      if (!unique.has(key)) {
        unique.add(key)
        verts.push(v)
      }
    }
    return {
      wireframeGeometry: new WireframeGeometry2(geo),
      vertices: verts,
    }
  }, [])

  // Cập nhật viewport khi đổi kích thước
  useEffect(() => {
    const onResize = () => {
      camera.aspect = size.width / size.height
      camera.updateProjectionMatrix()
      gl.setSize(size.width, size.height)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [camera, gl, size])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime()
      meshRef.current.rotation.x = t * rotationSpeed.current.x
      meshRef.current.rotation.y = t * rotationSpeed.current.y
      meshRef.current.rotation.z = t * rotationSpeed.current.z
      // Đổi chữ ở giữa mỗi khi xoay qua 45 độ (PI/4)
      const angle = meshRef.current.rotation.y
      const lastAngle = lastAngleRef.current
      const step = Math.PI / 4 // 45 độ
      if (words.length > 0 && Math.floor(angle / step) !== Math.floor(lastAngle / step)) {
        // Chọn random một từ khác với centerWord
        const candidates = words.filter(w => w !== centerWord)
        if (candidates.length > 0) {
          const newWord = candidates[Math.floor(Math.random() * candidates.length)]
          setCenterWord(newWord)
        }
      }
      lastAngleRef.current = angle
    }
    if (wireframeRef.current) {
      const t = clock.getElapsedTime()
      wireframeRef.current.rotation.x = t * rotationSpeed.current.x
      wireframeRef.current.rotation.y = t * rotationSpeed.current.y
      wireframeRef.current.rotation.z = t * rotationSpeed.current.z
    }
  })

  useEffect(() => {
    // Gán từ vào các đỉnh
    wordObjects.current = words.map((word, idx) => {
      const pos = vertices[idx % vertices.length]
      return {
        word,
        position: pos.clone(),
      }
    })
    setCenterWord(mainWord)
  }, [words, mainWord, vertices])

  return (
    <>
      {/* Từ chính ở giữa - KHÔNG nằm trong group xoay */}
      <Text
        position={[0, 0, 0]}
        fontSize={6.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineColor="#fff"
        outlineWidth={0.15}
        outlineBlur={0.1}
        outlineOpacity={0.4}
        billboard
      >
        {centerWord}
      </Text>
      {/* Group xoay cho wireframe và các từ liên quan */}
      <group ref={meshRef}>
        {/* Wireframe */}
        <primitive
          object={new Wireframe(wireframeGeometry, new LineMaterial({
            color: 0x4080ff,
            linewidth: 4,
            dashed: false,
          }))}
          scale={[1, 1, 1]}
          ref={wireframeRef}
        />
        {/* Các từ liên quan */}
        {wordObjects.current.map((obj, idx) => (
          <Text
            key={idx}
            position={obj.position}
            fontSize={3.0}
            color="white"
            anchorX="center"
            anchorY="middle"
            onClick={() => onWordSelect(obj.word)}
            billboard
            depthTest={false}
            renderOrder={10}
          >
            {obj.word}
          </Text>
        ))}
      </group>
    </>
  )
}

export default WordSphere