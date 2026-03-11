import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

const INITIAL_STUDENTS = [
  { id: 1, name: 'Rohit Kumar', email: 'rohit.kumar@example.com', age: '22' },
  { id: 2, name: 'Sneha Patel', email: 'sneha.patel@example.com', age: '21' },
]

const EMPTY_FORM = {
  name: '',
  email: '',
  age: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function App() {
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadingText, setLoadingText] = useState('Loading students...')

  useEffect(() => {
    const timer = setTimeout(() => {
      setStudents(INITIAL_STUDENTS)
      setIsLoading(false)
    }, 900)

    return () => clearTimeout(timer)
  }, [])

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    if (!keyword) {
      return students
    }

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(keyword) ||
        student.email.toLowerCase().includes(keyword) ||
        student.age.toString().includes(keyword)
      )
    })
  }, [searchTerm, students])

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredStudents])

  const validate = () => {
    const nextErrors = {}
    const cleanName = formData.name.trim()
    const cleanEmail = formData.email.trim()
    const cleanAge = formData.age.toString().trim()

    if (!cleanName) {
      nextErrors.name = 'Name is required.'
    }

    if (!cleanEmail) {
      nextErrors.email = 'Email is required.'
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!cleanAge) {
      nextErrors.age = 'Age is required.'
    } else if (!/^\d+$/.test(cleanAge) || Number(cleanAge) < 1) {
      nextErrors.age = 'Age must be a valid positive number.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
  }

  const runWithLoading = async (text, action) => {
    setLoadingText(text)
    setIsLoading(true)

    await new Promise((resolve) => {
      setTimeout(() => {
        action()
        resolve()
      }, 500)
    })

    setIsLoading(false)
    setLoadingText('Loading students...')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      age: formData.age.toString().trim(),
    }

    if (editingId !== null) {
      await runWithLoading('Updating student...', () => {
        setStudents((prev) =>
          prev.map((student) =>
            student.id === editingId ? { ...student, ...payload } : student,
          ),
        )
      })
    } else {
      await runWithLoading('Adding student...', () => {
        setStudents((prev) => [
          ...prev,
          {
            id: Date.now(),
            ...payload,
          },
        ])
      })
    }

    resetForm()
  }

  const handleEdit = (student) => {
    setEditingId(student.id)
    setFormData({
      name: student.name,
      email: student.email,
      age: student.age.toString(),
    })
    setErrors({})
  }

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?')

    if (!confirmDelete) {
      return
    }

    await runWithLoading('Deleting student...', () => {
      setStudents((prev) => prev.filter((student) => student.id !== studentId))
    })

    if (editingId === studentId) {
      resetForm()
    }
  }

  const exportToExcel = (rows, fileName) => {
    const exportRows = rows.map(({ name, email, age }) => ({
      Name: name,
      Email: email,
      Age: age,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    XLSX.writeFile(workbook, fileName)
  }

  const handleExportFiltered = () => {
    exportToExcel(filteredStudents, 'students-filtered.xlsx')
  }

  const handleExportAll = () => {
    exportToExcel(students, 'students-all.xlsx')
  }

  const disableExportFiltered = filteredStudents.length === 0 || isLoading
  const disableExportAll = students.length === 0 || isLoading
  const inputClassName =
    'w-full rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition duration-300 ease-out placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
  const primaryBtnClassName =
    'rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm will-change-transform transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'
  const secondaryBtnClassName =
    'rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm will-change-transform transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'
  const dangerBtnClassName =
    'rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm will-change-transform transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {isLoading && (
        <div
          className="fixed inset-0 z-20 grid place-items-center bg-slate-900/35 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-lg">
            {loadingText}
          </div>
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 p-5 text-slate-900 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Student Management System</h1>
            <p className="mt-1 text-sm text-slate-700">
              Manage students with add, edit, delete, filter, and Excel download.
            </p>
          </div>
          <div className="rounded-xl border border-blue-300 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 backdrop-blur">
            Total: {students.length}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md sm:p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId !== null ? 'Edit Student' : 'Add Student'}
          </h2>

          <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Name
              <input
                className={inputClassName}
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Enter full name"
              />
              {errors.name && <span className="text-xs text-rose-600">{errors.name}</span>}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Email
              <input
                className={inputClassName}
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Enter email"
              />
              {errors.email && <span className="text-xs text-rose-600">{errors.email}</span>}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Age
              <input
                className={inputClassName}
                type="number"
                min="1"
                value={formData.age}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, age: event.target.value }))
                }
                placeholder="Enter age"
              />
              {errors.age && <span className="text-xs text-rose-600">{errors.age}</span>}
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button className={primaryBtnClassName} type="submit" disabled={isLoading}>
                {editingId !== null ? 'Update Student' : 'Add Student'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className={secondaryBtnClassName}
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md sm:p-5">
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <input
              className={`${inputClassName} lg:max-w-md`}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by name, email, or age"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={secondaryBtnClassName}
                disabled={disableExportFiltered}
                onClick={handleExportFiltered}
              >
                Download Filtered Excel
              </button>
              <button
                type="button"
                className={secondaryBtnClassName}
                disabled={disableExportAll}
                onClick={handleExportAll}
              >
                Download Full Excel
              </button>
            </div>
          </div>

          <p className="mb-3 text-sm font-medium text-slate-600">
            Total Results: {filteredStudents.length}
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`transition-colors duration-200 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">{student.name}</td>
                      <td className="px-4 py-3 text-slate-700">{student.email}</td>
                      <td className="px-4 py-3 text-slate-700">{student.age}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={secondaryBtnClassName}
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={dangerBtnClassName}
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
