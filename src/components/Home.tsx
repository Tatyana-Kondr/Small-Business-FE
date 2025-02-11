import { Button } from "@mui/material"
import Products from "../features/products/Products"

export default function Home(){
    return(
        <div>
          <Button variant="contained" color="primary"> Нажми меня </Button>
          <Products />
      </div>
    )
}