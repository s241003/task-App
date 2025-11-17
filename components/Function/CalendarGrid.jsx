function CalendarGrid({ currentMonth, selectedDate, onSelectDate }) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = firstDay.getDay()

  const today = new Date()
  const cells = []

  for (let i = 0; i < startDay; i++) {
    cells.push(<td key={`empty-${i}`}></td>)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day)
    const isToday = cellDate.toDateString() === today.toDateString()
    const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString()

    const dayOfWeek = cellDate.getDay()
    const bgColor =
      dayOfWeek === 0
        ? '#ffe5e5' // 日曜：薄い赤
        : dayOfWeek === 6
        ? '#e5f0ff' // 土曜：薄い青
        : 'white' // 平日

    cells.push(
      <td
        key={day}
        className={isSelected ? 'selected' : ''}
        style={{
          backgroundColor: bgColor,
          border: isToday ? '2px solid red' : '1px solid #ccc', // ✅ 外枠を常に表示
        }}
        onClick={() => onSelectDate(cellDate)}
      >
        {day}
      </td>
    )

  }

  const rows = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(
      <tr key={i}>
        {cells.slice(i, i + 7)}
      </tr>
    )
  }

  return (
    <table id="calendar">
      <thead>
        <tr>
          <th　style={{ color: 'red' }}>日</th>
          <th>月</th>
          <th>火</th>
          <th>水</th>
          <th>木</th>
          <th>金</th>
          <th style={{ color: 'blue' }}>土</th>
        </tr>
      </thead>
      <tbody id="calendarBody">
        {rows}
      </tbody>
    </table>
  )
}

export default CalendarGrid
