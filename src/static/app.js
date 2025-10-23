document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
          let participantsList;
          if (details.participants.length > 0) {
            participantsList = document.createElement("div");
            participantsList.className = "participants-section";
            const title = document.createElement("p");
            title.innerHTML = "<strong>Current Participants:</strong>";
            participantsList.appendChild(title);
            const list = document.createElement("div");
            list.className = "participants-list no-bullets";
            details.participants.forEach(email => {
              const item = document.createElement("div");
              item.className = "participant-item";
              const emailSpan = document.createElement("span");
              emailSpan.textContent = email;
              // Delete icon
              const deleteBtn = document.createElement("span");
              deleteBtn.className = "delete-icon";
              deleteBtn.title = "Unregister participant";
              deleteBtn.innerHTML = "&#128465;"; // Trash can emoji
              deleteBtn.style.cursor = "pointer";
              deleteBtn.style.marginLeft = "8px";
              deleteBtn.onclick = async () => {
                if (confirm(`Unregister ${email} from ${name}?`)) {
                  try {
                    const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                      method: "POST"
                    });
                    const result = await response.json();
                    if (response.ok) {
                      messageDiv.textContent = result.message || "Participant unregistered.";
                      messageDiv.className = "success";
                      fetchActivities();
                    } else {
                      messageDiv.textContent = result.detail || "Failed to unregister participant.";
                      messageDiv.className = "error";
                    }
                    messageDiv.classList.remove("hidden");
                    setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
                  } catch (error) {
                    messageDiv.textContent = "Error unregistering participant.";
                    messageDiv.className = "error";
                    messageDiv.classList.remove("hidden");
                    setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
                  }
                }
              };
              item.appendChild(emailSpan);
              item.appendChild(deleteBtn);
              list.appendChild(item);
            });
            participantsList.appendChild(list);
          } else {
            participantsList = document.createElement("p");
            participantsList.innerHTML = "<em>No participants yet - be the first to join!</em>";
          }

          activityCard.innerHTML = `
            <h4>${name}</h4>
            <p>${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          `;
          activityCard.appendChild(participantsList);
          activitiesList.appendChild(activityCard);

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
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
