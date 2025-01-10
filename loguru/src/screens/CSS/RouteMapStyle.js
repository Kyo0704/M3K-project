import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  addPinButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  activeButton: {
    backgroundColor: "#C1A14E",
  },
  deleteButton: {
    position: "absolute",
    left: 16,
    bottom: 16,
    backgroundColor: "#ff4136",
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  addPinMessage: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  newMarkerInput: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: "#C1A14E",
    padding: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  cancelButton: {
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#333",
  },
  continueButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  continueButtonText: {
    color: "#fff",
  },
});

export default styles;