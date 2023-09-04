
import { useNavigate } from 'react-router-dom'

export const withRouter = (Component) => {

    const wrapper = (props) => {
      const navigate = useNavigate()
      
      return (
        <Component
          navigate={navigate}
          {...props}
          />
      )
    }
    
    return wrapper
  }