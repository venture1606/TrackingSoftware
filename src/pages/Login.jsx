import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setMessage } from "../redux/slices/common";
import { Icon } from "@iconify/react";

// Importing Api
import Auth from "../services/Auth";

// Importing the styles.
import "../styles/login.css";
import Loading from "../hooks/Loading";
import Logo from "../assets/logo.jpg";

function Login() {
  const dispatch = useDispatch();
  const [isCreateAccount, setIsCreateAccount] = useState(false);

  const { handleRegister, handleLogin, loading } = Auth();

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    employeeId: "",
    role: "",
    department: [],
    accessLevel: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (deptValue) => {
    setForm((prev) => {
      const currentDepts = prev.department || [];
      const newDepts = currentDepts.includes(deptValue)
        ? currentDepts.filter((d) => d !== deptValue)
        : [...currentDepts, deptValue];
      return { ...prev, department: newDepts };
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    handleLogin(form);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();

    // Email Validation: Must end with @adlhre.com
    if (!form.email.toLowerCase().endsWith("@adlhre.com")) {
      dispatch(
        setMessage({
          status: "error",
          description: "Please use a valid company email address (@adlhre.com)",
          message: "Invalid Domain",
        }),
      );
      return;
    }

    if (form.department.length === 0 || !form.accessLevel) {
      dispatch(
        setMessage({
          status: "error",
          description:
            "Please select at least one Department and an Access Level",
          message: "Missing Fields",
        }),
      );
      return;
    }

    handleRegister(form);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="LoginContainer">
      {!isCreateAccount ? (
        <form className="LoginForm" onSubmit={handleLoginSubmit}>
          <div className="LoginHeader">
            <img src={Logo} alt="ADL Logo" className="LoginLogo" />
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in</p>
          </div>
          <div className="InputGroup">
            <label>Business Email</label>
            <div className="InputWithIcon">
              <Icon icon="mdi:email-outline" className="InputIcon" />
              <input
                type="email"
                name="email"
                placeholder="email@adlhre.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="InputGroup">
            <label>Password</label>
            <div className="InputWithIcon">
              <Icon icon="mdi:lock-outline" className="InputIcon" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="PrimaryButton">
            Sign In
          </button>
          <div className="LoginFooter">
            <span>
              New here?{" "}
              <button
                type="button"
                className="LinkButton"
                onClick={() => setIsCreateAccount(true)}
              >
                Create Account
              </button>
            </span>
          </div>
        </form>
      ) : (
        <form className="CreateAccountForm" onSubmit={handleCreateAccount}>
          <div className="LoginHeader">
            <img src={Logo} alt="ADL Logo" className="LoginLogo" />
            <h2>Create Account</h2>
            <p>Join the ADL platform today</p>
          </div>

          <div className="FormGrid">
            <div className="InputGroup">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="InputGroup">
              <label>Business Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@adlhre.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="InputGroup">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="InputGroup">
              <label>Employee ID</label>
              <input
                type="text"
                name="employeeId"
                placeholder="ADL-001"
                value={form.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="InputGroup">
              <label>Job Designation</label>
              <input
                type="text"
                name="role"
                placeholder="Executive"
                value={form.role}
                onChange={handleChange}
                required
              />
            </div>

            <div className="InputGroup">
              <label>System Authorization Level</label>
              <select
                name="accessLevel"
                value={form.accessLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="read">Review & Insight (Read Access)</option>
                <option value="create">
                  Operational Contributor (Creating Access)
                </option>
                <option value="edit">
                  Operational Controller (Editing Access)
                </option>
                <option value="admin">
                  Administrative Management (Full Access)
                </option>
              </select>
            </div>

            <div className="InputGroup FullWidth">
              <div className="LabelWithAction">
                <label>Departments (Select multiple)</label>
                <label className="CheckboxLabel SelectAll">
                  <input
                    type="checkbox"
                    checked={
                      form.department.length ===
                      [
                        "design",
                        "quality",
                        "production",
                        "sales",
                        "purchase",
                        "maintainance",
                        "stores",
                        "hr",
                      ].length
                    }
                    onChange={(e) => {
                      const allDepts = [
                        "design",
                        "quality",
                        "production",
                        "sales",
                        "purchase",
                        "maintainance",
                        "stores",
                        "hr",
                      ];
                      setForm((prev) => ({
                        ...prev,
                        department: e.target.checked ? allDepts : [],
                      }));
                    }}
                  />
                  <span>Select All</span>
                </label>
              </div>
              <div className="CheckboxGroup">
                {[
                  { value: "design", label: "Design and Development" },
                  { value: "quality", label: "Quality Assurance" },
                  { value: "production", label: "Production Management" },
                  { value: "sales", label: "Sales & Marketing" },
                  { value: "purchase", label: "Procurement & Stores" },
                  { value: "maintainance", label: "Facility Management" },
                  { value: "stores", label: "Stores Management" },
                  { value: "hr", label: "Human Resources" },
                ].map((dept) => (
                  <label key={dept.value} className="CheckboxLabel">
                    <input
                      type="checkbox"
                      checked={form.department.includes(dept.value)}
                      onChange={() => handleDepartmentChange(dept.value)}
                    />
                    <span>{dept.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="PrimaryButton">
            Register Account
          </button>

          <div className="LoginFooter">
            <span>
              Already have an account?{" "}
              <button
                type="button"
                className="LinkButton"
                onClick={() => setIsCreateAccount(false)}
              >
                Back to Login
              </button>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;
