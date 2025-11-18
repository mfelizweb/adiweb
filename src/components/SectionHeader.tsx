"use client";

import React from "react";
import { motion } from "framer-motion";

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="mb-6"
    >
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
