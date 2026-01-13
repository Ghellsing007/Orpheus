import { MainLayout } from "@/components/layout/main-layout"
import { LibraryScreen } from "@/components/screens/library-screen"

export default function RecentSongsPage() {
  return (
    <MainLayout>
      <LibraryScreen initialFilter="all" />
    </MainLayout>
  )
}
