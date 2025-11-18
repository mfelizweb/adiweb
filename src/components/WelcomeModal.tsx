// components/WelcomeModal.tsx (web)
"use client";

import { useEffect, useState } from "react";
 
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

const slides = [
  {
    image: "/icon.png",
    title: "¡Bienvenido a ADI!",
    desc: "Descubre los mejores lugares, itinerarios y experiencias cerca de ti.",
  },
  {
    image: "/adi.png",
    title: "Planifica tus aventuras",
    desc: "Crea tus propios itinerarios o explora los de la comunidad.",
  },
  {
    image: "/2.png",
    title: "Guarda tus favoritos",
    desc: "Lleva el control de los lugares que más te gustan y compártelos.",
  },
  {
    image: "/3.png",
    title: "¡Empieza a explorar!",
    desc: "Encuentra tu próxima aventura ahora con ADI.",
  },
];

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("welcomeSeen");
    if (!seen) setOpen(true);
  }, []);

  const handleNext = () => {
    if (step < slides.length - 1) setStep((s) => s + 1);
    else {
      localStorage.setItem("welcomeSeen", "true");
      setOpen(false);
    }
  };

  const current = slides[step];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 rounded-3xl overflow-hidden bg-white text-center">
        <div className="p-6 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <Image
                src={current.image}
                alt={current.title}
                width={220}
                height={180}
                className="rounded-xl mb-4"
              />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {current.title}
              </h2>
              <p className="text-gray-600 text-sm mb-6">{current.desc}</p>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className="flex justify-center mb-4 gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`transition-all h-2 rounded-full ${
                  step === i ? "bg-emerald-600 w-6" : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {step === slides.length - 1 ? "Comenzar" : "Siguiente"}
          </Button>

          <button
            onClick={() => {
              localStorage.setItem("welcomeSeen", "true");
              setOpen(false);
            }}
            className="mt-3 text-sm text-gray-500 hover:underline"
          >
            Omitir introducción
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
