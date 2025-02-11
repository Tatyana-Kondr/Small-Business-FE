import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { getProducts, selectProducts } from "./productsSlice"

export default function Products() {
    const dispatch = useAppDispatch()
    const products = useAppSelector(selectProducts)
    const [isVisible, setIsVisible] = useState(false)
  
    const handleLoadProducts = async () => {
      await dispatch(getProducts())
      setIsVisible(true)
    }
  
    return (
      <div>
        <button onClick={handleLoadProducts}>Показать продукты</button>
        {isVisible && (
          <ul>
            {products.length > 0 ? (
              products.map((product) => (
                <li key={product.id}>{product.name} - {product.article}</li>
              ))
            ) : (
              <p>Нет доступных продуктов</p>
            )}
          </ul>
        )}
      </div>
    )
  }
  