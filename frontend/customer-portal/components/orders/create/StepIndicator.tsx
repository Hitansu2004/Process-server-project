'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
    number: number
    title: string
    icon: any
    description: string
}

export default function StepIndicator({ steps, currentStep }: { steps: Step[], currentStep: number }) {
    return (
        <div className="mb-8">
            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = currentStep > step.number
                    const isCurrent = currentStep === step.number
                    
                    return (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <motion.div
                                    animate={{
                                        scale: isCurrent ? 1.1 : 1,
                                    }}
                                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                        isCompleted
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg'
                                            : isCurrent
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl'
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-8 h-8 text-white" />
                                    ) : (
                                        <Icon className={`w-7 h-7 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                                    )}
                                </motion.div>
                                <div className="mt-3 text-center">
                                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                            
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-4 relative" style={{ maxWidth: '80px' }}>
                                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <div className="flex items-center justify-center gap-2 mb-4">
                    {steps.map((step) => {
                        const isCompleted = currentStep > step.number
                        const isCurrent = currentStep === step.number
                        
                        return (
                            <div
                                key={step.number}
                                className={`h-2 flex-1 rounded-full transition-all ${
                                    isCompleted || isCurrent
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                        : 'bg-gray-200'
                                }`}
                            />
                        )
                    })}
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
                    <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
                </div>
            </div>
        </div>
    )
}
