import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
const ThreeDView = () => {
    const mountRef = useRef(null);
    useEffect(() => {
        if (!mountRef.current)
            return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        camera.position.z = 5;
        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);
    return (<div className="w-full h-96" ref={mountRef}>
     
    </div>);
};
export default ThreeDView;
