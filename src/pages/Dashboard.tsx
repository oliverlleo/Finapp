import React from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { FinancialCharts } from '../components/dashboard/FinancialCharts';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Dashboard: React.FC = () => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o desempenho financeiro do seu workspace.</p>
      </motion.div>
      
      <motion.div variants={item}>
        <SummaryCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="h-full">
          <FinancialCharts />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <RecentTransactions />
        </motion.div>
      </div>
    </motion.div>
  );
};
