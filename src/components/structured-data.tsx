const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Drive Clone",
    description:
      "Secure cloud storage and file sharing application with 10GB free storage",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "10GB free storage",
    },
    featureList: [
      "File upload and storage",
      "Folder organization",
      "Enterprise-grade security",
      "Cloud access from anywhere",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
