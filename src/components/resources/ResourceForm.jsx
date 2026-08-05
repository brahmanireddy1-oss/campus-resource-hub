import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { getBranches } from '@/lib/api/branches'
import { getYears } from '@/lib/api/years'
import { getSemestersByYearId } from '@/lib/api/semesters'
import { getSubjectsBySemesterId } from '@/lib/api/subjects'
import { getResourceTypes } from '@/lib/api/resourceTypes'
import { createResource } from '@/lib/api/resources'

const MAX_FILE_MB = 50

/**
 * initial: { branchId, yearId, semesterId, subjectId } — used to prefill
 * when arriving from a Subject page's "Submit Resource" link.
 */
export default function ResourceForm({ initial = {}, onSuccess }) {
  const { user, isAdmin } = useAuth()

  const [branches, setBranches] = useState([])
  const [years, setYears] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [types, setTypes] = useState([])

  const [branchId, setBranchId] = useState(initial.branchId || '')
  const [yearId, setYearId] = useState(initial.yearId || '')
  const [semesterId, setSemesterId] = useState(initial.semesterId || '')
  const [subjectId, setSubjectId] = useState(initial.subjectId || '')
  const [resourceTypeId, setResourceTypeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)

  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getBranches(), getResourceTypes()])
      .then(([b, t]) => {
        setBranches(b)
        setTypes(t)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingOptions(false))
  }, [])

  useEffect(() => {
    if (!branchId) {
      setYears([])
      return
    }
    getYears({ branchId }).then(setYears).catch((err) => toast.error(err.message))
  }, [branchId])

  useEffect(() => {
    if (!yearId) {
      setSemesters([])
      return
    }
    getSemestersByYearId(yearId).then(setSemesters).catch((err) => toast.error(err.message))
  }, [yearId])

  useEffect(() => {
    if (!semesterId) {
      setSubjects([])
      return
    }
    getSubjectsBySemesterId(semesterId).then(setSubjects).catch((err) => toast.error(err.message))
  }, [semesterId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subjectId || !resourceTypeId || !title || !file) {
      toast.error('Please fill in all required fields and choose a file.')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_FILE_MB} MB.`)
      return
    }

    setSubmitting(true)
    try {
      const resource = await createResource({
        subjectId,
        resourceTypeId,
        title,
        description,
        file,
        userId: user.id,
      })
      toast.success(isAdmin ? 'Resource published.' : 'Submitted for approval.')
      setTitle('')
      setDescription('')
      setResourceTypeId('')
      setFile(null)
      onSuccess?.(resource)
    } catch (err) {
      toast.error(err.message || 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Branch"
          value={branchId}
          onChange={(e) => {
            setBranchId(e.target.value)
            setYearId('')
            setSemesterId('')
            setSubjectId('')
          }}
          disabled={loadingOptions}
          required
        >
          <option value="">Select branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>

        <Select
          label="Year"
          value={yearId}
          onChange={(e) => {
            setYearId(e.target.value)
            setSemesterId('')
            setSubjectId('')
          }}
          disabled={!branchId}
          required
        >
          <option value="">Select year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </Select>

        <Select
          label="Semester"
          value={semesterId}
          onChange={(e) => {
            setSemesterId(e.target.value)
            setSubjectId('')
          }}
          disabled={!yearId}
          required
        >
          <option value="">Select semester</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          disabled={!semesterId}
          required
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <Select
        label="Resource Type"
        value={resourceTypeId}
        onChange={(e) => setResourceTypeId(e.target.value)}
        disabled={loadingOptions}
        required
      >
        <option value="">Select type</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>

      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional — what's covered, which chapters, etc."
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text)]">File</label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--color-line)] px-4 py-8 text-center hover:border-[var(--color-accent)]">
          <UploadCloud size={22} className="text-[var(--color-text-muted)]" strokeWidth={1.75} />
          <span className="text-sm text-[var(--color-text-muted)]">
            {file ? file.name : 'PDF, ZIP, or image — up to 50 MB'}
          </span>
          <input
            type="file"
            accept=".pdf,.zip,image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Uploading…' : isAdmin ? 'Publish Resource' : 'Submit for Approval'}
      </Button>
    </form>
  )
}
