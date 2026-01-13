import { MainLayout } from "@/components/layout/main-layout"
import { LibraryScreen } from "@/components/screens/library-screen"

export default function LikedSongsPage() {
  return (
    <MainLayout>
      <LibraryScreen initialFilter="songs" />
    </MainLayout>
  )
}
