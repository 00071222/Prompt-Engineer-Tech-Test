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
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col justify-start items-center text-white relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl space-y-6 relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Products Inventory Catalog
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Catálogo general de productos y control de stock en tiempo real
            </p>
          </div>

          <CreateProductButton />
        </div>

        <ProductList />
        <ProductModal />
      </div>
    </div>
  );
}
