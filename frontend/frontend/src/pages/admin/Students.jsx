function Students() {
  const students = [
    {
      id: "SC001",
      name: "Charan",
      email: "charan@example.com",
      department: "CSE",
    },
    {
      id: "SC002",
      name: "Test Student",
      email: "student001@example.com",
      department: "CSE",
    },
    {
      id: "SC004",
      name: "Phase 11 Student",
      email: "phase11student@example.com",
      department: "CSE",
    },
  ];

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Students
      </h1>

      <div className="overflow-hidden rounded-2xl border border-white/10">

        <table className="w-full text-left">

          <thead className="bg-white/5">
            <tr>
              <th className="px-5 py-4">Student ID</th>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Department</th>
            </tr>
          </thead>

          <tbody>

            {students.map((student) => (
              <tr
                key={student.id}
                className="border-t border-white/10"
              >
                <td className="px-5 py-4">
                  {student.id}
                </td>

                <td className="px-5 py-4">
                  {student.name}
                </td>

                <td className="px-5 py-4 text-slate-400">
                  {student.email}
                </td>

                <td className="px-5 py-4">
                  {student.department}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Students;