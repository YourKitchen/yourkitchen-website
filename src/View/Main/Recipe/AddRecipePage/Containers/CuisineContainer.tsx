import React from 'react'

interface CuisineContainerProps {
  cuisine: string
  setCuisine: (value: string) => void
}

const CuisineContainer: React.FC<CuisineContainerProps> = ({
  cuisine,
  setCuisine,
}) => {
  return (
    <select
      value={cuisine}
      onChange={(event) => {
        setCuisine(event.target.value)
      }}
    >
      <option value="american">American</option>
      <option value="brazilian">Brazilian</option>
      <option value="british">British</option>
      <option value="caribbean">Caribbean</option>
      <option value="chinese">Chinese</option>
      <option value="french">French</option>
      <option value="greek">Greek</option>
      <option value="indian">Indian</option>
      <option value="italian">Italian</option>
      <option value="japanese">Japanese</option>
      <option value="mediterranean">Mediterranean</option>
      <option value="mexican">Mexican</option>
      <option value="moroccan">Moroccan</option>
      <option value="spanish">Spanish</option>
      <option value="thai">Thai</option>
      <option value="turkish">Turkish</option>
      <option value="vietnamese">Vietnamese</option>
      <option value="other">Other</option>
    </select>
  )
}

export default CuisineContainer
