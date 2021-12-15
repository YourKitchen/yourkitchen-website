import React from 'react'
import AnimateHeight from 'react-animate-height'
import { Recipe } from '@yourkitchen/models'

interface StepsContainerProps {
  recipe: Recipe
  showSteps: boolean
}

const StepsContainer: React.FC<StepsContainerProps> = ({
  recipe,
  showSteps,
}) => {
  return (
    <div className="stepsContainer">
      <AnimateHeight duration={500} height={showSteps ? 'auto' : 0}>
        <h2>Steps</h2>
        <ol>
          {recipe.steps.map((step: string, index: number) => (
            <li className="step" key={index + 1 /* STEP NUMBER */}>
              <p className="stepText">{step}</p>
            </li>
          ))}
        </ol>
      </AnimateHeight>
    </div>
  )
}

export default StepsContainer
