"use client";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Visitor } from "@/interfaces/visitors";

const styles = StyleSheet.create({
  body: {
    padding: 15,
    color: "#14293D",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    paddingVertical: 6,
    borderBottom: "1px solid #E4E4E7",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "1px solid #E4E4E7",
  },
  cell: {
    fontSize: 9,
    color: "#14293D",
    paddingHorizontal: 4,
  },
  headerCellText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#71717A",
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #E4E4E7",
    paddingTop: 4,
  },
  footerText: {
    fontSize: 9,
    color: "#14293D",
  },
});

// largura percentual de cada coluna
const columns = [
  { label: "Nome", width: "20%" },
  { label: "Empresa", width: "20%" },
  { label: "Email", width: "25%" },
  { label: "CNPJ", width: "15%" },
  { label: "Telefone", width: "12%" },
  { label: "CEP", width: "8%" },
];

interface PdfVisitorsProps {
  data: Visitor[];
}

const PdfVisitorsReport: React.FC<PdfVisitorsProps> = ({ data: visitors }) => (
  <Document>
    <Page size="A4" style={styles.body} orientation="landscape">
      <Image
        fixed
        src="/logo2.png"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: "auto",
          opacity: 0.1,
        }}
      />
      Cabeçalho
      <View style={styles.header} fixed>
        <Text style={styles.title}>Lista de Participantes - ExpoMultiMix</Text>
      </View>
      <View style={styles.tableHeader} fixed>
        {columns.map((col, i) => (
          <View key={i} style={{ width: col.width }}>
            <Text style={styles.headerCellText}>{col.label}</Text>
          </View>
        ))}
      </View>
      {visitors.map((v) => (
        <View key={v.id} style={styles.tableRow} wrap={false}>
          <View style={{ width: columns[0].width }}>
            <Text style={styles.cell}>{v.name}</Text>
          </View>
          <View style={{ width: columns[1].width }}>
            <Text style={styles.cell}>{v.company}</Text>
          </View>
          <View style={{ width: columns[2].width }}>
            <Text style={styles.cell}>{v.email}</Text>
          </View>
          <View style={{ width: columns[3].width }}>
            <Text style={styles.cell}>
              {v.category.toLowerCase() === "visitante" ? "Visitante" : v.cnpj}
            </Text>
          </View>
          <View style={{ width: columns[4].width }}>
            <Text style={styles.cell}>{v.phone}</Text>
          </View>
          <View style={{ width: columns[5].width }}>
            <Text style={styles.cell}>{v.zipCode}</Text>
          </View>
        </View>
      ))}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Participe da próxima ExpoMultiMix!
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);

export default PdfVisitorsReport;
