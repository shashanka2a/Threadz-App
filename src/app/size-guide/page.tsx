import { ContentPage } from "@/components/content-page";

export default function SizeGuidePage() {
  return (
    <ContentPage
      title="Size Guide"
      description="Find your best fit across plain and oversized styles."
    >
      <p>
        Our tees are available in S, M, L, and XL. Plain fits are true to size with a
        regular silhouette. Oversized styles are cut wider with dropped shoulders for a
        relaxed look.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-left">Chest (in)</th>
              <th className="p-3 text-left">Length (in)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="p-3">S</td>
              <td className="p-3">36–38</td>
              <td className="p-3">27</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-3">M</td>
              <td className="p-3">38–40</td>
              <td className="p-3">28</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-3">L</td>
              <td className="p-3">40–42</td>
              <td className="p-3">29</td>
            </tr>
            <tr>
              <td className="p-3">XL</td>
              <td className="p-3">42–44</td>
              <td className="p-3">30</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>For oversized styles, size up if you prefer an extra-loose fit.</p>
    </ContentPage>
  );
}
