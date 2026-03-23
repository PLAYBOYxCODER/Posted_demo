'use client';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Heart, User, Settings, ShoppingCart, Grid, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dock Sub-Components internal logic
function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-[10px] bg-[#060010] border border-[#222] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] cursor-pointer outline-none ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child => cloneElement(child as React.ReactElement, { isHovered } as any))}
    </motion.div>
  );
}

function DockLabel({ children, className = '', ...rest }: any) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`absolute top-[-1.5rem] left-1/2 w-max whitespace-pre rounded-[0.375rem] border border-[#222] bg-[#060010] px-2 py-0.5 text-xs text-white ${className}`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: any) {
  return <div className={`flex items-center justify-center text-white ${className}`}>{children}</div>;
}

function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 60,
  distance = 150,
  panelHeight = 60,
  dockHeight = 100,
  baseItemSize = 40
}: any) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-center">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 flex items-end w-max gap-4 rounded-2xl bg-[#060010] border border-[#222] px-3 pb-3 pt-3 shadow-2xl z-50 ${className}`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item: any, index: number) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Master component exported for absolute structural layout usage
export default function MobileDock() {
  const router = useRouter();
  
  const items = [
    { icon: <Home size={22} />, label: 'Home', onClick: () => router.push('/') },
    { icon: <Grid size={22} />, label: 'Categories', onClick: () => router.push('/categories') },
    { icon: <User size={22} />, label: 'Profile', onClick: () => router.push('/profile') },
    { icon: <ShoppingCart size={22} />, label: 'Cart', onClick: () => router.push('/cart') },
  ];

  return (
    <div className="md:hidden block pointer-events-auto">
      <Dock 
        items={items}
        panelHeight={64}
        baseItemSize={44}
        magnification={65}
      />
    </div>
  );
}
