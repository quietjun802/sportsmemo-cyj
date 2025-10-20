import React from 'react'
import FileList from './FileList'
import UploadForm from './UploadForm'
const userDashboard = () => {
  return (
    <section>
      <UploadForm/>
      <FileList/>
    </section>
  )
}

export default userDashboard