import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { editProduct, selectProduct } from "../productsSlice";
import { UpdateProductDto } from "../types";
import { selectProductCategories } from "../productCategoriesSlice";
import { Box, Button, TextField, MenuItem, Select, SelectChangeEvent } from "@mui/material";

interface EditProductProps {
    productId: number;
    closeModal: () => void;
}

export default function EditProduct({ productId, closeModal }: EditProductProps) {
    const dispatch = useAppDispatch();
    const selectedProduct = useAppSelector(selectProduct);
    const categories = useAppSelector(selectProductCategories);

    const [productData, setProductData] = useState<UpdateProductDto | null>(null);

    useEffect(() => {
        if (selectedProduct) {
            setProductData({
                name: selectedProduct.name,
                article: selectedProduct.article,
                vendorArticle: selectedProduct.vendorArticle || "",
                purchasingPrice: selectedProduct.purchasingPrice,
                sellingPrice: selectedProduct.sellingPrice,
                unitOfMeasurement: selectedProduct.unitOfMeasurement || "",
                weight: selectedProduct.weight || 0,
                newDimensions: {
                    height: selectedProduct.newDimensions?.height || 0,
                    length: selectedProduct.newDimensions?.length || 0,
                    width: selectedProduct.newDimensions?.width || 0,
                },
                productCategory: selectedProduct.productCategory || { id: 0, name: "" },
                description: selectedProduct.description || "",
                customsNumber: selectedProduct.customsNumber || "",
            });
        }
    }, [selectedProduct]);

    if (!productData) return <p>Loading...</p>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData((prev) => prev ? { ...prev, [name]: value } : prev);
    };

    const handleDimensionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData((prev) => ({
            ...prev!,
            newDimensions: {
                ...(prev?.newDimensions ?? { height: 0, length: 0, width: 0 }),
                [name]: Number(value),
            },
        }));
    };


    const handleCategoryChange = (e: SelectChangeEvent<number>) => {
        const categoryId = Number(e.target.value);
        const category = categories.find((cat) => cat.id === categoryId);
        if (category) {
          setProductData((prev) => ({
            ...prev!,
            productCategory: category,
          }));
        }
      };
      
      

    const handleSubmit = async () => {
        try {
            if (!productData) return;
            await dispatch(editProduct({ id: productId, updateProductDto: productData }));
            alert("Продукт успешно обновлён!");
            closeModal();
        } catch (error) {
            console.error("Ошибка при обновлении продукта:", error);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <h2>Редактировать продукт</h2>

            <TextField
                fullWidth
                margin="normal"
                label="Название"
                name="name"
                value={productData.name}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Артикул"
                name="vendorArticle"
                value={productData.vendorArticle}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Цена закупки"
                name="purchasingPrice"
                type="number"
                value={productData.purchasingPrice}
                onChange={handleChange}
            />

<TextField
                fullWidth
                margin="normal"
                label="Цена продажи"
                name="sellingPrice"
                type="number"
                value={productData.sellingPrice}
                onChange={handleChange}
            />

<TextField
                fullWidth
                margin="normal"
                label="Masseinheit"
                name="unitOfMeasurement"
                value={productData.unitOfMeasurement}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Вес"
                name="weight"
                type="number"
                value={productData.weight}
                onChange={handleChange}
            />

            <h3>Размеры</h3>
            <input name="height" type="number" value={productData.newDimensions?.height ?? ""} onChange={handleDimensionsChange} />

            <input name="length" type="number" value={productData.newDimensions?.length ?? ""} onChange={handleDimensionsChange} />

            <input name="width" type="number" value={productData.newDimensions?.width ?? ""} onChange={handleDimensionsChange} />

            <h3>Категория</h3>
            <Select value={productData.productCategory?.id} onChange={handleCategoryChange}>
                {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                        {category.name}
                    </MenuItem>
                ))}
            </Select>
            <TextField
                fullWidth
                margin="normal"
                label="Описание"
                name="description"
                value={productData.description}
                onChange={handleChange}
            />


            <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Сохранить
                </Button>
                <Button variant="outlined" color="secondary" onClick={closeModal}>
                    Отмена
                </Button>
            </Box>
        </Box>
    );
}
