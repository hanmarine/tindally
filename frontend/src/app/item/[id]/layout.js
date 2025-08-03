export async function generateMetadata({ params }) {
  const { id } = await params;

  const response = await fetch(`http://localhost:5000/api/items/${id}`);
  if (!response.ok) {
    return {
      title: `Item Not Found | Tindally`,
      description: `Item not found.`,
    };
  }

  const item = await response.json();

  return {
    title: `${item.name} | Tindally`,
    description: `Item details in your store inventory.`,
  };
}

export default function ItemDetailsLayout({ children }) {
  return children;
}
