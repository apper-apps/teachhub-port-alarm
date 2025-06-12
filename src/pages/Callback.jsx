import React, { useEffect } from 'react'

const Callback = () => {
  useEffect(() => {
    const { ApperUI } = window.ApperSDK;
    ApperUI.showSSOVerify("#authentication-callback");
  }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50">
      <div id="authentication-callback">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    </div>
  )
}

export default Callback