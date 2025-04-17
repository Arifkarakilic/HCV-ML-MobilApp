import { useState } from "react";
import { TextInput, Button, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import axios from "axios";

const emptyForm = {
  WBC: "",
  RBC: "",
  BMI: "",
  Plat: "",
  RNA_Base: "",
  RNA_4: "",
  AST_1: "",
  ALT_1: "",
  ALT4: "",
  ALT_12: "",
  ALT_24: "",
  ALT_48: "",
  ALT_36: "",
  ALT_after_24_w: "",
};

const DataForm = ({ data, setData }) => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editData, setEditData] = useState(null);
  const [errors, setErrors] = useState({});
  const [gradingResult, setGradingResult] = useState(null);

  const handleChange = (field) => (text) => {
    // sadece sayı ve nokta (.) kabul et, birden fazla nokta engellenir
    const filtered = text.replace(/[^0-9.]/g, "");

    // birden fazla nokta varsa engelle
    const parts = filtered.split(".");
    if (parts.length > 2) return;

    setFormData({ ...formData, [field]: filtered });
  };

  const handleBlur = (field) => {
    if (!formData[field]) {
      setErrors((prev) => ({ ...prev, [field]: `${field} boş bırakılamaz` }));
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = Object.keys(formData);
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field} boş bırakılamaz`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const numericForm = {};
    for (const key in formData) {
      numericForm[key] = parseFloat(formData[key]);
    }

    try {
        // 👉 API adresi: android emulator için 10.0.2.2
        const response = await axios.post("http://192.168.1.206:5000/predict", numericForm);
        console.log(response.data);
        const stage = response.data.predicted_stage;
    
        let stageText = "";
        if (stage === 0) stageText = "Düşük";
        else if (stage === 1) stageText = "Orta";
        else if (stage === 2) stageText = "Yüksek";
        else stageText = `Bilinmeyen Seviye (${stage})`;
    
        setGradingResult(stageText);
      } catch (error) {
        console.error("Tahmin hatası:", error);
        console.log("Axios error:", error.toJSON ? error.toJSON() : error.message);
        setGradingResult("Sunucu hatası");
      }
    
      if (editData !== null) {
        const updated = [...data];
        updated[editData] = formData;
        setData(updated);
        setEditData(null);
      } else {
        setData([...data, formData]);
      }
    
      setFormData({ ...emptyForm });
      setErrors({});
    };

  const handleDelete = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    if (editData === index) {
      setEditData(null);
    }
  };

  const handleEdit = (index) => {
    setFormData(data[index]);
    setEditData(index);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
    >
      {Object.keys(formData).map((field) => (
        <ThemedView key={field} style={styles.inputGroup}>
          <ThemedText style={styles.label}>{field}</ThemedText>
          <TextInput
            style={styles.input}
            value={formData[field]}
            onChangeText={handleChange(field)}
            onBlur={() => handleBlur(field)}
            keyboardType="decimal-pad"
            inputMode="numeric"
            placeholder={`${field} giriniz`}
          />
          {errors[field] && (
            <ThemedText style={styles.error}>{errors[field]}</ThemedText>
          )}
        </ThemedView>
      ))}

      <Button
        title={editData !== null ? "Güncelle" : "Ekle"}
        onPress={handleSubmit}
      />

      {gradingResult && (
        <ThemedView style={{ marginTop: 20 }}>
          <ThemedText style={styles.resultLabel}>
            Hesaplanan Histolojik Derece:
          </ThemedText>
          <ThemedText style={styles.resultValue}>{gradingResult}</ThemedText>
        </ThemedView>
      )}

      <ThemedText style={styles.listTitle}>Kayıtlar:</ThemedText>

      {Array.isArray(data) &&
        data.map((item, index) => (
          <ThemedView key={index} style={styles.listItem}>
            <ThemedText>#{index + 1}</ThemedText>
            <Button title="Düzenle" onPress={() => handleEdit(index)} />
            <Button
              title="Sil"
              color="red"
              onPress={() => handleDelete(index)}
            />
          </ThemedView>
        ))}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
  },
  error: {
    color: "red",
    marginTop: 4,
  },
  listTitle: {
    marginTop: 24,
    fontWeight: "bold",
    fontSize: 16,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultValue: {
    fontSize: 18,
    color: "#0a7ea4",
    marginTop: 4,
  },
});

export default DataForm;
