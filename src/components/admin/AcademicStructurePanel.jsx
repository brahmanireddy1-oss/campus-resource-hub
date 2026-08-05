import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FileUp } from 'lucide-react'
import ManagedList from './ManagedList'
import { slugify } from '@/utils/slugify'
import { getBranches, createBranch, updateBranch, deleteBranch } from '@/lib/api/branches'
import { getYears, createYear, updateYear, deleteYear } from '@/lib/api/years'
import { getSemestersByYearId, createSemester, updateSemester, deleteSemester } from '@/lib/api/semesters'
import { getSubjectsBySemesterId, createSubject, updateSubject, deleteSubject } from '@/lib/api/subjects'
import {
  getResourceTypes,
  createResourceType,
  updateResourceType,
  deleteResourceType,
} from '@/lib/api/resourceTypes'
import { uploadSyllabusFile } from '@/lib/api/storage'

export default function AcademicStructurePanel() {
  const [branches, setBranches] = useState([])
  const [years, setYears] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [types, setTypes] = useState([])

  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)

  const loadBranches = () => getBranches().then(setBranches).catch((err) => toast.error(err.message))
  const loadTypes = () => getResourceTypes().then(setTypes).catch((err) => toast.error(err.message))

  useEffect(() => {
    loadBranches()
    loadTypes()
  }, [])

  useEffect(() => {
    if (!selectedBranch) {
      setYears([])
      setSelectedYear(null)
      return
    }
    getYears({ branchId: selectedBranch.id }).then(setYears).catch((err) => toast.error(err.message))
    setSelectedYear(null)
  }, [selectedBranch])

  useEffect(() => {
    if (!selectedYear) {
      setSemesters([])
      setSelectedSemester(null)
      return
    }
    getSemestersByYearId(selectedYear.id).then(setSemesters).catch((err) => toast.error(err.message))
    setSelectedSemester(null)
  }, [selectedYear])

  useEffect(() => {
    if (!selectedSemester) {
      setSubjects([])
      return
    }
    getSubjectsBySemesterId(selectedSemester.id).then(setSubjects).catch((err) => toast.error(err.message))
  }, [selectedSemester])

  // ---- Branches ----
  const saveBranch = async (values, editing) => {
    try {
      if (editing) {
        await updateBranch(editing.id, { name: values.name, slug: slugify(values.name) })
        toast.success('Branch updated')
      } else {
        await createBranch({ name: values.name, slug: slugify(values.name), orderIndex: branches.length })
        toast.success('Branch added')
      }
      loadBranches()
    } catch (err) {
      toast.error(err.message)
    }
  }
  const removeBranch = async (item) => {
    try {
      await deleteBranch(item.id)
      toast.success('Branch deleted')
      if (selectedBranch?.id === item.id) setSelectedBranch(null)
      loadBranches()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ---- Years ----
  const loadYears = () =>
    selectedBranch && getYears({ branchId: selectedBranch.id }).then(setYears).catch((err) => toast.error(err.message))
  const saveYear = async (values, editing) => {
    try {
      if (editing) {
        await updateYear(editing.id, { name: values.name, slug: slugify(values.name) })
        toast.success('Year updated')
      } else {
        await createYear({
          branchId: selectedBranch.id,
          name: values.name,
          slug: slugify(values.name),
          orderIndex: years.length,
        })
        toast.success('Year added')
      }
      loadYears()
    } catch (err) {
      toast.error(err.message)
    }
  }
  const removeYear = async (item) => {
    try {
      await deleteYear(item.id)
      toast.success('Year deleted')
      if (selectedYear?.id === item.id) setSelectedYear(null)
      loadYears()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ---- Semesters ----
  const saveSemester = async (values, editing) => {
    try {
      if (editing) {
        await updateSemester(editing.id, { name: values.name, slug: slugify(values.name) })
        toast.success('Semester updated')
      } else {
        await createSemester({
          yearId: selectedYear.id,
          name: values.name,
          slug: slugify(values.name),
          orderIndex: semesters.length,
        })
        toast.success('Semester added')
      }
      getSemestersByYearId(selectedYear.id).then(setSemesters)
    } catch (err) {
      toast.error(err.message)
    }
  }
  const removeSemester = async (item) => {
    try {
      await deleteSemester(item.id)
      toast.success('Semester deleted')
      if (selectedSemester?.id === item.id) setSelectedSemester(null)
      getSemestersByYearId(selectedYear.id).then(setSemesters)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ---- Subjects ----
  const saveSubject = async (values, editing) => {
    try {
      if (editing) {
        await updateSubject(editing.id, { name: values.name, code: values.code, slug: slugify(values.name) })
        toast.success('Subject updated')
      } else {
        await createSubject({
          semesterId: selectedSemester.id,
          name: values.name,
          code: values.code,
          slug: slugify(values.name),
          orderIndex: subjects.length,
        })
        toast.success('Subject added')
      }
      getSubjectsBySemesterId(selectedSemester.id).then(setSubjects)
    } catch (err) {
      toast.error(err.message)
    }
  }
  const removeSubject = async (item) => {
    try {
      await deleteSubject(item.id)
      toast.success('Subject deleted')
      getSubjectsBySemesterId(selectedSemester.id).then(setSubjects)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ---- Resource types ----
  const saveType = async (values, editing) => {
    try {
      if (editing) {
        await updateResourceType(editing.id, { name: values.name, slug: slugify(values.name) })
        toast.success('Resource type updated')
      } else {
        await createResourceType({ name: values.name, slug: slugify(values.name), orderIndex: types.length })
        toast.success('Resource type added')
      }
      loadTypes()
    } catch (err) {
      toast.error(err.message)
    }
  }
  const removeType = async (item) => {
    try {
      await deleteResourceType(item.id)
      toast.success('Resource type deleted')
      loadTypes()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4" style={{ minHeight: '22rem' }}>
        <ManagedList
          title="Branches"
          items={branches}
          selectedId={selectedBranch?.id}
          onSelect={setSelectedBranch}
          onSave={saveBranch}
          onDelete={removeBranch}
        />
        <ManagedList
          title="Years"
          items={years}
          selectedId={selectedYear?.id}
          onSelect={setSelectedYear}
          onSave={saveYear}
          onDelete={removeYear}
          disabled={!selectedBranch}
          disabledMessage="Select a branch first."
          renderExtra={(year) => <SyllabusUploadButton year={year} onUploaded={loadYears} />}
        />
        <ManagedList
          title="Semesters"
          items={semesters}
          selectedId={selectedSemester?.id}
          onSelect={setSelectedSemester}
          onSave={saveSemester}
          onDelete={removeSemester}
          disabled={!selectedYear}
          disabledMessage="Select a year first."
        />
        <ManagedList
          title="Subjects"
          items={subjects.map((s) => ({ ...s, subtitle: s.code }))}
          onSave={saveSubject}
          onDelete={removeSubject}
          disabled={!selectedSemester}
          disabledMessage="Select a semester first."
          extraFields={[{ key: 'code', label: 'Code (optional)' }]}
        />
      </div>

      <div className="max-w-sm">
        <ManagedList title="Resource Types" items={types} onSave={saveType} onDelete={removeType} />
      </div>
    </div>
  )
}

function SyllabusUploadButton({ year, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { publicUrl, fileName } = await uploadSyllabusFile(file, year.id)
      await updateYear(year.id, { syllabus_url: publicUrl, syllabus_file_name: fileName })
      toast.success('Syllabus uploaded')
      onUploaded?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Upload syllabus"
        title="Upload syllabus PDF"
        disabled={uploading}
        className="rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
      >
        <FileUp size={13} />
      </button>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
    </span>
  )
}
