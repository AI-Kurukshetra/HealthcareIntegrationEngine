interface UserFilterOption {
  id: string;
  label: string;
}

interface EntityOption {
  value: string;
  label: string;
}

interface LogFiltersFormProps {
  entityMode: "select" | "text";
  entityOptions?: EntityOption[];
  entityValue: string;
  actionValue: string;
  userValue: string;
  dateFromValue: string;
  dateToValue: string;
  limitValue: string;
  users: UserFilterOption[];
}

export function LogFiltersForm({
  entityMode,
  entityOptions = [],
  entityValue,
  actionValue,
  userValue,
  dateFromValue,
  dateToValue,
  limitValue,
  users
}: LogFiltersFormProps) {
  return (
    <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entityMode === "select" ? (
        <select
          name="entity"
          defaultValue={entityValue}
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          {entityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name="entity"
          type="text"
          defaultValue={entityValue}
          placeholder="Entity type (example: channel)"
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        />
      )}

      <input
        name="action"
        type="text"
        defaultValue={actionValue}
        placeholder="Action/event contains..."
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
      />

      <select
        name="user"
        defaultValue={userValue}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
      >
        <option value="">All users</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.label}
          </option>
        ))}
      </select>

      <input
        name="date_from"
        type="date"
        defaultValue={dateFromValue}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
      />

      <input
        name="date_to"
        type="date"
        defaultValue={dateToValue}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
      />

      <input
        name="limit"
        type="number"
        min={1}
        max={300}
        defaultValue={limitValue}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
      />

      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:col-span-2 xl:col-span-3 xl:w-fit"
      >
        Apply filters
      </button>
    </form>
  );
}
