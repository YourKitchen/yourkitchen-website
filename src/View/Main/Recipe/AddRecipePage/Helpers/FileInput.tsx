import React from 'react'

interface FileInputProps {
  value: File | undefined
  onChange: (file: File) => void
  accept?: string
}

const FileInput: React.FC<FileInputProps> = ({
  value,
  onChange,
  accept = '',
  ...rest
}) => (
  <div>
    <label>
      <p className="imageLabel">
        {value ? value.name : 'Click to select image...'}
      </p>
      <input
        {...rest}
        style={{ display: 'none' }}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (!e.target.files) {
            return
          }
          onChange(e.target.files[0])
        }}
      />
    </label>
  </div>
)

export default FileInput
