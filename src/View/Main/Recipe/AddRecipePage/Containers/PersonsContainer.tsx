import React from 'react'

interface PersonsContainerProps {
  persons: number
  setPersons: (value: number) => void
}

const PersonsContainer: React.FC<PersonsContainerProps> = ({
  persons,
  setPersons,
}) => {
  return (
    <select
      value={persons}
      onChange={(event) => {
        setPersons(parseInt(event.target.value))
      }}
    >
      <option value="1">1 Person</option>
      <option value="2">2 Persons</option>
      <option value="3">3 Persons</option>
      <option value="4">4 Persons</option>
      <option value="5">5 Persons</option>
      <option value="6">6 Persons</option>
      <option value="7">7 Persons</option>
      <option value="8">8 Persons</option>
      <option value="9">9 Persons</option>
      <option value="10">10 Persons</option>
      <option value="11">11 Persons</option>
      <option value="12">12 Persons</option>
      <option value="13">13 Persons</option>
      <option value="14">14 Persons</option>
      <option value="15">15 Persons</option>
      <option value="16">16 Persons</option>
      <option value="17">17 Persons</option>
      <option value="18">18 Persons</option>
      <option value="19">19 Persons</option>
      <option value="20">20 Persons</option>
    </select>
  )
}

export default PersonsContainer
