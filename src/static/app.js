document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const template = document.getElementById("activity-template");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and list
      activitiesList.innerHTML = "";
      // Reset select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list using template
      Object.entries(activities).forEach(([name, details]) => {
        const spotsLeft = details.max_participants - (details.participants?.length || 0);

        const clone = template.content.cloneNode(true);
        clone.querySelector(".activity-name").textContent = name;
        clone.querySelector(".description").textContent = details.description || "";
        clone.querySelector(".schedule").textContent = details.schedule || "";
        clone.querySelector(".spots-count").textContent = String(spotsLeft);

        const participantsUl = clone.querySelector(".participants-list");
        const noParticipants = clone.querySelector(".no-participants");

        // Populate participants
        participantsUl.innerHTML = "";
        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = p;
            participantsUl.appendChild(li);
          });
          noParticipants.hidden = true;
        } else {
          noParticipants.hidden = false;
        }

        // Wire card signup button to pre-select activity and focus email input
        const cardSignupBtn = clone.querySelector(".signup-btn");
        cardSignupBtn.addEventListener("click", () => {
          activitySelect.value = name;
          document.getElementById("email").focus();
          document.getElementById("signup-container").scrollIntoView({ behavior: "smooth" });
        });

        activitiesList.appendChild(clone);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        // Refresh activities to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
