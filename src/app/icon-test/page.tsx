"use client";

import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoDiamondOutline } from "react-icons/io5";
import { MdOutlineDiamond } from "react-icons/md";
import { RiDiamondLine } from "react-icons/ri";
import { LuDiamond } from "react-icons/lu";
import { TbDiamond } from "react-icons/tb";

export default function IconTest() {
  const icons = [
    { name: "IoDiamondOutline", icon: <IoDiamondOutline /> },
    { name: "MdOutlineDiamond", icon: <MdOutlineDiamond /> },
    { name: "RiDiamondLine", icon: <RiDiamondLine /> },
    { name: "LuDiamond", icon: <LuDiamond /> },
    { name: "TbDiamond", icon: <TbDiamond /> },
  ];

  return (
    <main className="min-h-screen bg-white p-12 text-black">
      <h1 className="mb-10 text-2xl font-bold">Skinstric Icon Test</h1>

      <div className="grid grid-cols-5 gap-8">
        {icons.map(({ name, icon }) => (
          <div key={name} className="flex flex-col items-center gap-4">
            <div className="text-5xl">{icon}</div>
            <span className="text-xs">{name}</span>
          </div>
        ))}
      </div>

      <div className="mt-16 flex gap-16">
        <div className="flex flex-col items-center gap-3">
          <FaCaretLeft className="text-3xl" />
          <span className="text-xs">FaCaretLeft</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <FaCaretRight className="text-3xl" />
          <span className="text-xs">FaCaretRight</span>
        </div>
      </div>

      <section className="mt-16 flex items-center justify-center gap-32">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <LuDiamond className="absolute h-7 w-7 stroke-[1]" />
            <FaCaretLeft className="relative h-2 w-2" />
          </div>
          <span className="text-xs">DISCOVER AI</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <LuDiamond className="absolute h-7 w-7 stroke-[1]" />
            <FaCaretRight className="relative h-2 w-2" />
          </div>
          <span className="text-xs">TAKE TEST</span>
        </div>
      </section>
    </main>
  );
}
