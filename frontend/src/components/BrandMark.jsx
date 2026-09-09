import logo from '../assets/ccf-logo.png'
import './BrandMark.css'

function BrandMark() {
  return (
    <div className="brand-mark">
      <img className="brand-mark__logo" src={logo} alt="Cold Creek Farm" />
    </div>
  )
}

export default BrandMark
