# DEÜ Tınaztepe Kampüsü — Spektral Analiz Görselleştirmeleri
# Manovich Cultural Analytics Estetiği
# Gerekli paketler: ggplot2, dplyr, readr, ggridges, scales

library(ggplot2)
library(dplyr)
library(readr)
library(ggridges)
library(scales)

# Veriyi oku
piksel_veri <- read_csv("piksel_veri.csv", show_col_types = FALSE)

# Fakülte sıralama (NDVI ortalamasına göre)
fakulte_sirasi <- piksel_veri %>%
  group_by(fakulte) %>%
  summarise(ort = mean(ndvi, na.rm = TRUE)) %>%
  arrange(ort) %>%
  pull(fakulte)

piksel_veri <- piksel_veri %>%
  mutate(fakulte = factor(fakulte, levels = fakulte_sirasi))

# Renk paleti — sofistike, birbirinden ayrışan tonlar
renkler <- c(
  "Guzel Sanatlar" = "#E07A5F",
  "Fen Edebiyat"   = "#3D405B",
  "Isletme"        = "#81B29A",
  "Denizcilik"     = "#F2CC8F",
  "Hukuk"          = "#5E6472",
  "Muhendislik"    = "#9B2335",
  "Mimarlik"       = "#F0E6D3",
  "Turizm"         = "#577590"
)

# Ortak tema
tema <- theme_minimal(base_family = "mono") +
  theme(
    plot.background   = element_rect(fill = "#000000", color = NA),
    panel.background  = element_rect(fill = "#000000", color = NA),
    panel.grid        = element_blank(),
    axis.text         = element_text(color = "#cccccc", size = 9),
    axis.title        = element_text(color = "#e0e0e0", size = 11),
    strip.background  = element_rect(fill = "#000000", color = NA),
    strip.text        = element_text(color = "#e0e0e0", size = 10),
    legend.background = element_rect(fill = "#000000", color = NA),
    legend.key        = element_rect(fill = "#000000", color = NA),
    legend.text       = element_text(color = "#cccccc", size = 9),
    legend.title      = element_text(color = "#e0e0e0", size = 10),
    plot.title        = element_blank(),
    plot.margin       = margin(25, 25, 25, 25)
  )


# GÖRSEL 1 — Fakülte Bazlı NDVI-NDBI Saçılım Grafiği
g1 <- ggplot(piksel_veri, aes(x = ndvi, y = ndbi, color = fakulte)) +
  geom_point(alpha = 0.6, size = 1.8, shape = 16) +
  scale_color_manual(values = renkler) +
  labs(x = "NDVI", y = "NDBI", color = "Fakülte") +
  annotate("text",
           x = max(piksel_veri$ndvi, na.rm = TRUE),
           y = min(piksel_veri$ndbi, na.rm = TRUE),
           label = "DEÜ Tınaztepe Kampüsü — Sentinel-2 NDVI/NDBI",
           color = "#888888", family = "mono", size = 3.2,
           hjust = 1, vjust = -0.5) +
  tema +
  theme(legend.position = "right")

ggsave("gorsel_1_piksel_sacilim_fakulte.png", g1,
       width = 4000, height = 3000, units = "px", dpi = 300, bg = "#000000")


# GÖRSEL 2 — Sıralanmış Piksel Şeridi (fakülte bazlı)
piksel_serit <- piksel_veri %>%
  filter(!is.na(ndvi), !is.na(fakulte)) %>%
  group_by(fakulte) %>%
  arrange(ndvi, .by_group = TRUE) %>%
  mutate(sira = row_number(), y = 1) %>%
  ungroup()

ndvi_renk <- c("#5C3A1E", "#8B6914", "#C4A535", "#7DB556", "#2E7D32")

g2 <- ggplot(piksel_serit, aes(x = sira, y = y, fill = ndvi)) +
  geom_raster() +
  facet_wrap(~ fakulte, ncol = 1, scales = "free_x") +
  scale_fill_gradientn(
    colours = ndvi_renk,
    limits = range(piksel_serit$ndvi, na.rm = TRUE),
    oob = squish
  ) +
  labs(fill = "NDVI") +
  tema +
  theme(
    axis.text   = element_blank(),
    axis.title  = element_blank(),
    axis.ticks  = element_blank(),
    legend.position = "right",
    panel.spacing = unit(0.2, "lines")
  )

ggsave("gorsel_2_sirali_piksel_seridi_fakulte.png", g2,
       width = 6000, height = 2400, units = "px", dpi = 300, bg = "#000000")


# GÖRSEL 3 — NDVI Violin Plot (fakülte bazlı)
g3 <- ggplot(piksel_veri, aes(x = ndvi, y = fakulte, fill = fakulte)) +
  geom_violin(scale = "width", color = NA, alpha = 0.85, trim = TRUE) +
  scale_fill_manual(values = renkler) +
  labs(x = "NDVI", y = NULL) +
  tema +
  theme(
    legend.position = "none",
    axis.text.y = element_text(color = "#e0e0e0", size = 11)
  )

ggsave("gorsel_3_ndvi_violin.png", g3,
       width = 3000, height = 4000, units = "px", dpi = 300, bg = "#000000")


# GÖRSEL 4 — NDVI vs GLCM Kontrast Saçılım (eğer glcm_contrast sütunu varsa)
if ("glcm_contrast" %in% colnames(piksel_veri)) {

  g4 <- ggplot(piksel_veri, aes(x = ndvi, y = glcm_contrast, color = fakulte)) +
    geom_point(alpha = 0.6, size = 1.8, shape = 16) +
    scale_color_manual(values = renkler) +
    labs(x = "NDVI", y = "GLCM Contrast", color = "Fakülte") +
    annotate("text",
             x = max(piksel_veri$ndvi, na.rm = TRUE),
             y = min(piksel_veri$glcm_contrast, na.rm = TRUE),
             label = "DEÜ Tınaztepe Kampüsü — Sentinel-2 NDVI/NDBI/GLCM",
             color = "#888888", family = "mono", size = 3.2,
             hjust = 1, vjust = -0.5) +
    tema +
    theme(legend.position = "right")

  ggsave("gorsel_4_ndvi_glcm_sacilim.png", g4,
         width = 4000, height = 3000, units = "px", dpi = 300, bg = "#000000")


  # GÖRSEL 5 — GLCM Kontrast Violin Plot
  g5 <- ggplot(piksel_veri, aes(x = glcm_contrast, y = fakulte, fill = fakulte)) +
    geom_violin(scale = "width", color = NA, alpha = 0.85, trim = TRUE) +
    scale_fill_manual(values = renkler) +
    labs(x = "GLCM Contrast", y = NULL) +
    tema +
    theme(
      legend.position = "none",
      axis.text.y = element_text(color = "#e0e0e0", size = 11)
    )

  ggsave("gorsel_5_glcm_violin.png", g5,
         width = 3000, height = 4000, units = "px", dpi = 300, bg = "#000000")

  cat("5 görsel kaydedildi.\n")

} else {
  cat("glcm_contrast sütunu bulunamadı, 3 görsel kaydedildi.\n")
  cat("GLCM görselleri için CSV'de glcm_contrast sütunu olmalı.\n")
}
