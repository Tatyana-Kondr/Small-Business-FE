import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { editProduct, selectProduct } from "../productsSlice";
import { UpdateProductDto } from "../types";
import { getProductCategories, selectProductCategories } from "../productCategoriesSlice";
import { Box, Button, TextField, MenuItem, Select, SelectChangeEvent, FormControl, InputLabel } from "@mui/material";

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

    useEffect(() => {
        dispatch(getProductCategories());
    }, [dispatch]);

    if (!productData) return <p>Loading...</p>;
    if (!categories.length) return <p>Loading categories...</p>;

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
            alert("Das Produkt wurde erfolgreich aktualisiert!");
            closeModal();
        } catch (error) {
            console.error("Fehler bei der Produktaktualisierung:", error);
        }
    };
    console.log("Categories:", categories);

    return (
        <Box sx={{ p: 2 }}>
            <h2>Produkt bearbeiten</h2>

            <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={productData.name}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Artikel des Lieferanten"
                name="vendorArticle"
                value={productData.vendorArticle}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Kaufpreis"
                name="purchasingPrice"
                type="number"
                value={productData.purchasingPrice}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Verkaufspreis"
                name="sellingPrice"
                type="number"
                value={productData.sellingPrice}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Maßeinheit"
                name="unitOfMeasurement"
                value={productData.unitOfMeasurement}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Gewicht (kg)"
                name="weight"
                type="number"
                value={productData.weight}
                onChange={handleChange}
            />

            <TextField
                fullWidth
                margin="normal"
                label="Breite  (mm)"
                name="width"
                type="number"
                value={productData.newDimensions?.width ?? ""}
                onChange={handleDimensionsChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Länge (mm)"
                name="length"
                type="number"
                value={productData.newDimensions?.length ?? ""}
                onChange={handleDimensionsChange}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Höhe (mm)"
                name="height"
                type="number"
                value={productData.newDimensions?.height ?? ""}
                onChange={handleDimensionsChange}
            />

            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                <InputLabel id="category-label">Kategorie</InputLabel>
                <Select
                    labelId="category-label"
                    value={productData.productCategory?.id || ""}
                    onChange={handleCategoryChange}
                    displayEmpty
                    label="Kategorie"
                >
                    <MenuItem disabled value="">
                        Wählen Sie eine Kategorie
                    </MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                fullWidth
                margin="normal"
                label="Beschreibung"
                name="description"
                value={productData.description}
                onChange={handleChange}
            />


            <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Speichern
                </Button>
                <Button variant="outlined" color="secondary" onClick={closeModal}>
                    Abbrechen
                </Button>
            </Box>
        </Box>
    );
}
