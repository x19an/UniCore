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
import { useFormStatus } from 'react-dom'
import { Loader2, Hexagon } from 'lucide-react'

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus()
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      formAction={isLogin ? login : signup}
      disabled={pending}
      className={cn(
        buttonVariants({ variant: isLogin ? 'default' : 'outline' }),
        'w-full h-11 transition-all',
        isLogin ? 'shadow-md hover:shadow-lg' : 'border-border/50 bg-background/30 hover:bg-muted/50'
      )}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Authenticating...' : isLogin ? 'Log in' : 'Create an account'}
    </motion.button>
  )
}

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
                <Hexagon className="w-6 h-6 text-primary fill-primary/20" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                UniCore
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-sm">
                Log in to access your student dashboard
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
                <SubmitButton isLogin={true} />
                <SubmitButton isLogin={false} />
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
