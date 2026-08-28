'use client'

import { login, signup } from './actions'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'

export default function LoginPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Animated ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md z-10"
      >
        <Card className="w-full shadow-2xl border-border/50 bg-card/60 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <motion.div variants={itemVariants}>
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                UniCore
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-sm">
                Your sleek AI-powered future assistant
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@university.edu"
                  required
                  className="bg-background/50 focus-visible:ring-primary/50 transition-all h-11"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-background/50 focus-visible:ring-primary/50 transition-all h-11"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  formAction={login}
                  className={cn(buttonVariants({ variant: 'default' }), 'w-full h-11 shadow-md hover:shadow-lg transition-all')}
                >
                  Log in
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  formAction={signup}
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full h-11 border-border/50 bg-background/30 hover:bg-muted/50 transition-all')}
                >
                  Create an account
                </motion.button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
