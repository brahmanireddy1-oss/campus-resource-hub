import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import AdminRoute from '@/routes/AdminRoute'
import Home from '@/pages/Home'
import Browse from '@/pages/Browse'
import Branch from '@/pages/Branch'
import Year from '@/pages/Year'
import Semester from '@/pages/Semester'
import Subject from '@/pages/Subject'
import Login from '@/pages/Login'
import AdminDashboard from '@/pages/AdminDashboard'
import About from '@/pages/About'
import NotFound from '@/pages/NotFound'

// Route param convention: branchId / yearId / semesterId / subjectId are
// the DB records' slug or id, matching the
// Branch -> Year -> Semester -> Subject drill-down.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/branches/:branchId" element={<Branch />} />
        <Route path="/branches/:branchId/years/:yearId" element={<Year />} />
        <Route
          path="/branches/:branchId/years/:yearId/semesters/:semesterId"
          element={<Semester />}
        />
        <Route
          path="/branches/:branchId/years/:yearId/semesters/:semesterId/subjects/:subjectId"
          element={<Subject />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
