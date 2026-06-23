import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import ProductList from "@/components/products/product-list";
import ProductModal from "@/components/products/product-modal";
import CreateProductButton from "@/components/products/create-product-button";

export default async function ProductsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>

      <div className="flex justify-between items-center border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Products Inventory Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Catálogo general de productos y control de stock en tiempo real
          </p>
        </div>

        <CreateProductButton />
      </div>

      <ProductList />
      <ProductModal />
    </div>
  );
}
