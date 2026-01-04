import React, { useState, useEffect } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
} from '@mui/material'
import { NavigateNext, NavigateBefore } from '@mui/icons-material'

interface Step {
  label: string
  content: React.ReactNode
  optional?: boolean
}

interface CustomStepperProps {
  steps: Step[]
  onComplete: () => void
  orientation?: 'horizontal' | 'vertical'
  showSkip?: boolean
  onSkip?: () => void
}

const CustomStepper = ({
  steps,
  onComplete,
  orientation = 'horizontal',
  showSkip = false,
  onSkip,
}: CustomStepperProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const totalSteps = steps.length
  const completedSteps = completed.size
  const isLastStep = activeStep === totalSteps - 1
  const allStepsCompleted = completedSteps === totalSteps

  useEffect(() => {
    setCompleted(new Set())
    setActiveStep(0)
  }, [steps])

  const handleNext = () => {
    const newActiveStep =
      isLastStep && !allStepsCompleted
        ? steps.findIndex((step, i) => !completed.has(i))
        : activeStep + 1
    setActiveStep(newActiveStep)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleStep = (step: number) => () => {
    setActiveStep(step)
  }

  const handleComplete = () => {
    const newCompleted = new Set(completed)
    newCompleted.add(activeStep)
    setCompleted(newCompleted)

    if (newCompleted.size !== totalSteps) {
      handleNext()
    } else {
      onComplete()
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setCompleted(new Set())
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stepper
        activeStep={activeStep}
        orientation={orientation}
        sx={{ mb: 4 }}
      >
        {steps.map((step, index) => (
          <Step
            key={step.label}
            completed={completed.has(index)}
            onClick={handleStep(index)}
            sx={{ cursor: 'pointer' }}
          >
            <StepLabel optional={step.optional}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        {allStepsCompleted ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h5" gutterBottom>
              🎉 All steps completed successfully!
            </Typography>
            <Button onClick={handleReset} variant="outlined" sx={{ mt: 2 }}>
              Reset
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step {activeStep + 1} of {totalSteps}
            </Typography>
            <Box sx={{ minHeight: 200, mb: 3 }}>
              {steps[activeStep].content}
            </Box>

            <Box display="flex" justifyContent="space-between" gap={2}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<NavigateBefore />}
              >
                Back
              </Button>

              <Box display="flex" gap={1}>
                {showSkip && onSkip && (
                  <Button onClick={onSkip} color="secondary">
                    Skip
                  </Button>
                )}
              </Box>

              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NavigateNext />}
                sx={{ ml: 'auto' }}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default CustomStepper